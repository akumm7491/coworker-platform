import express from 'express';
import { createServer } from 'http';
import { Pool } from 'pg';
import { Kafka } from 'kafkajs';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import { Client } from '@elastic/elasticsearch';

// PostgreSQL connection for commands
const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// MongoDB connection for queries
mongoose.connect(process.env.MONGODB_URL as string);

// Redis client for caching and rate limiting
const redis = new Redis(process.env.REDIS_URL);

// Elasticsearch client for search
const elasticsearch = new Client({
  node: process.env.ELASTICSEARCH_URL,
});

// Kafka setup
const kafka = new Kafka({
  clientId: 'agent-service',
  brokers: (process.env.KAFKA_BROKERS || '').split(','),
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'agent-service-group' });

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Rate limiting middleware
const rateLimiter = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const key = `ratelimit:${req.ip}`;
  const limit = 100; // requests
  const window = 60; // seconds

  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, window);
    }
    
    if (current > limit) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    next();
  }
};

app.use(rateLimiter);

// Agent Commands (PostgreSQL)
app.post('/api/agents', async (req, res) => {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    const { name, capabilities, projectId } = req.body;
    
    // Create agent in PostgreSQL
    const result = await client.query(
      'INSERT INTO agents (name, capabilities, project_id) VALUES ($1, $2, $3) RETURNING id',
      [name, capabilities, projectId]
    );
    
    // Emit agent.created event
    await producer.send({
      topic: 'coworker-platform.agents.events',
      messages: [{
        key: result.rows[0].id,
        value: JSON.stringify({
          type: 'agent.created',
          data: { id: result.rows[0].id, name, capabilities, projectId },
          timestamp: new Date().toISOString(),
        }),
      }],
    });

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  } finally {
    client.release();
  }
});

// Agent Queries (MongoDB)
app.get('/api/agents', async (req, res) => {
  try {
    const cacheKey = `agents:${JSON.stringify(req.query)}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const agents = await mongoose.model('Agent').find(req.query)
      .populate('projectId', 'name'); // Include project name in response
    
    await redis.set(cacheKey, JSON.stringify(agents), 'EX', 300); // Cache for 5 minutes
    
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Agent Assignment Command
app.post('/api/agents/:id/assign', async (req, res) => {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { taskId } = req.body;
    
    // Check if agent is available
    const agent = await client.query(
      'SELECT * FROM agents WHERE id = $1 FOR UPDATE',
      [id]
    );
    
    if (!agent.rows[0]) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    if (agent.rows[0].status !== 'available') {
      return res.status(400).json({ error: 'Agent is not available' });
    }
    
    // Assign task to agent
    await client.query(
      'UPDATE agents SET status = $1, current_task_id = $2 WHERE id = $3',
      ['assigned', taskId, id]
    );
    
    // Emit agent.assigned event
    await producer.send({
      topic: 'coworker-platform.agents.events',
      messages: [{
        key: id,
        value: JSON.stringify({
          type: 'agent.assigned',
          data: { id, taskId },
          timestamp: new Date().toISOString(),
        }),
      }],
    });

    await client.query('COMMIT');
    res.json({ message: 'Agent assigned successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error assigning agent:', error);
    res.status(500).json({ error: 'Failed to assign agent' });
  } finally {
    client.release();
  }
});

// Initialize Kafka consumer
async function initializeKafka() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ 
    topics: [
      'coworker-platform.agents.events',
      'coworker-platform.projects.events' // Listen for project events that might affect agents
    ]
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;
      
      const event = JSON.parse(message.value.toString());
      
      switch (event.type) {
        case 'agent.created':
        case 'agent.assigned':
          // Update read model in MongoDB
          await mongoose.model('Agent').findOneAndUpdate(
            { _id: event.data.id },
            event.data,
            { upsert: true }
          );
          
          // Index in Elasticsearch for full-text search
          await elasticsearch.index({
            index: 'agents',
            id: event.data.id,
            document: event.data,
          });
          break;
          
        case 'project.deleted':
          // Handle project deletion by updating affected agents
          await mongoose.model('Agent').updateMany(
            { projectId: event.data.id },
            { $set: { status: 'unassigned', projectId: null } }
          );
          break;
      }
    },
  });
}

// Start the service
async function start() {
  try {
    await initializeKafka();
    const port = process.env.AGENT_SERVICE_PORT || 3003;
    server.listen(port, () => {
      console.log(`Agent service listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start agent service:', error);
    process.exit(1);
  }
}

const server = createServer(app);
start();

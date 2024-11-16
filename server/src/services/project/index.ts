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

// Redis client for caching
const redis = new Redis(process.env.REDIS_URL);

// Elasticsearch client for search
const elasticsearch = new Client({
  node: process.env.ELASTICSEARCH_URL,
});

// Kafka setup
const kafka = new Kafka({
  clientId: 'project-service',
  brokers: (process.env.KAFKA_BROKERS || '').split(','),
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'project-service-group' });

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Project Commands (PostgreSQL)
app.post('/api/projects', async (req, res) => {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    const { name, description, ownerId } = req.body;
    
    // Create project in PostgreSQL
    const result = await client.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING id',
      [name, description, ownerId]
    );
    
    // Emit project.created event
    await producer.send({
      topic: 'coworker-platform.projects.events',
      messages: [{
        key: result.rows[0].id,
        value: JSON.stringify({
          type: 'project.created',
          data: { id: result.rows[0].id, name, description, ownerId },
          timestamp: new Date().toISOString(),
        }),
      }],
    });

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  } finally {
    client.release();
  }
});

// Project Queries (MongoDB)
app.get('/api/projects', async (req, res) => {
  try {
    const cacheKey = `projects:${JSON.stringify(req.query)}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const projects = await mongoose.model('Project').find(req.query);
    await redis.set(cacheKey, JSON.stringify(projects), 'EX', 300); // Cache for 5 minutes
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Initialize Kafka consumer
async function initializeKafka() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: 'coworker-platform.projects.events' });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;
      
      const event = JSON.parse(message.value.toString());
      
      // Update read model in MongoDB
      if (event.type === 'project.created') {
        await mongoose.model('Project').create(event.data);
        
        // Index in Elasticsearch for full-text search
        await elasticsearch.index({
          index: 'projects',
          id: event.data.id,
          document: event.data,
        });
      }
    },
  });
}

// Start the service
async function start() {
  try {
    await initializeKafka();
    const port = process.env.PROJECT_SERVICE_PORT || 3002;
    server.listen(port, () => {
      console.log(`Project service listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start project service:', error);
    process.exit(1);
  }
}

const server = createServer(app);
start();

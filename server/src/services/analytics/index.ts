import express from 'express';
import { createServer } from 'http';
import { Pool } from 'pg';
import { Kafka } from 'kafkajs';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import { Client } from '@elastic/elasticsearch';

// PostgreSQL connection for time-series data
const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// MongoDB connection for aggregated metrics
mongoose.connect(process.env.MONGODB_URL as string);

// Redis client for real-time metrics and caching
const redis = new Redis(process.env.REDIS_URL);

// Elasticsearch client for log analysis
const elasticsearch = new Client({
  node: process.env.ELASTICSEARCH_URL,
});

// Kafka setup
const kafka = new Kafka({
  clientId: 'analytics-service',
  brokers: (process.env.KAFKA_BROKERS || '').split(','),
});

const consumer = kafka.consumer({ groupId: 'analytics-service-group' });

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Real-time metrics endpoint
app.get('/api/analytics/realtime', async (req, res) => {
  try {
    const pipeline = redis.pipeline();
    
    // Fetch various real-time metrics
    pipeline.get('analytics:active_users');
    pipeline.get('analytics:requests_per_minute');
    pipeline.get('analytics:error_rate');
    pipeline.zrange('analytics:top_endpoints', 0, -1, 'WITHSCORES');
    
    const results = await pipeline.exec();
    
    res.json({
      activeUsers: parseInt(results[0][1] as string) || 0,
      requestsPerMinute: parseInt(results[1][1] as string) || 0,
      errorRate: parseFloat(results[2][1] as string) || 0,
      topEndpoints: results[3][1] || [],
    });
  } catch (error) {
    console.error('Error fetching real-time metrics:', error);
    res.status(500).json({ error: 'Failed to fetch real-time metrics' });
  }
});

// Historical metrics endpoint
app.get('/api/analytics/historical', async (req, res) => {
  const client = await pgPool.connect();
  try {
    const { startDate, endDate, metrics } = req.query;
    
    const result = await client.query(
      `SELECT 
        date_trunc('hour', timestamp) as time,
        metric_name,
        avg(value) as avg_value,
        sum(value) as total_value,
        count(*) as count
      FROM metrics
      WHERE timestamp BETWEEN $1 AND $2
        AND metric_name = ANY($3)
      GROUP BY date_trunc('hour', timestamp), metric_name
      ORDER BY time DESC`,
      [startDate, endDate, metrics]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching historical metrics:', error);
    res.status(500).json({ error: 'Failed to fetch historical metrics' });
  } finally {
    client.release();
  }
});

// Aggregated metrics endpoint
app.get('/api/analytics/aggregated', async (req, res) => {
  try {
    const { metric, groupBy, timeRange } = req.query;
    
    const cacheKey = `analytics:aggregated:${metric}:${groupBy}:${timeRange}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    
    const aggregation = await mongoose.model('Metric').aggregate([
      {
        $match: {
          timestamp: {
            $gte: new Date(Date.now() - parseInt(timeRange as string)),
          },
          name: metric,
        },
      },
      {
        $group: {
          _id: `$${groupBy}`,
          value: { $sum: '$value' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { value: -1 },
      },
    ]);
    
    await redis.set(cacheKey, JSON.stringify(aggregation), 'EX', 300); // Cache for 5 minutes
    
    res.json(aggregation);
  } catch (error) {
    console.error('Error fetching aggregated metrics:', error);
    res.status(500).json({ error: 'Failed to fetch aggregated metrics' });
  }
});

// Log search endpoint
app.get('/api/analytics/logs', async (req, res) => {
  try {
    const { query, startTime, endTime, size = 100 } = req.query;
    
    const response = await elasticsearch.search({
      index: 'logs-*',
      body: {
        query: {
          bool: {
            must: [
              { query_string: { query: query as string } },
              {
                range: {
                  '@timestamp': {
                    gte: startTime,
                    lte: endTime,
                  },
                },
              },
            ],
          },
        },
        size: parseInt(size as string),
        sort: [{ '@timestamp': 'desc' }],
      },
    });
    
    res.json(response.hits);
  } catch (error) {
    console.error('Error searching logs:', error);
    res.status(500).json({ error: 'Failed to search logs' });
  }
});

// Initialize Kafka consumer for event processing
async function initializeKafka() {
  await consumer.connect();
  await consumer.subscribe({ 
    topics: [
      'coworker-platform.users.events',
      'coworker-platform.projects.events',
      'coworker-platform.agents.events',
      'coworker-platform.billing.events'
    ]
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;
      
      const event = JSON.parse(message.value.toString());
      const timestamp = new Date();
      
      // Store event in PostgreSQL for time-series analysis
      const client = await pgPool.connect();
      try {
        await client.query(
          'INSERT INTO events (topic, event_type, data, timestamp) VALUES ($1, $2, $3, $4)',
          [topic, event.type, event.data, timestamp]
        );
        
        // Update real-time metrics in Redis
        const pipeline = redis.pipeline();
        
        // Increment event counter
        pipeline.incr(`analytics:events:${event.type}`);
        pipeline.expire(`analytics:events:${event.type}`, 86400); // Expire after 24 hours
        
        // Update event rate
        pipeline.zadd('analytics:event_rates', Date.now(), event.type);
        pipeline.zremrangebyscore('analytics:event_rates', '-inf', Date.now() - 60000); // Keep last minute
        
        await pipeline.exec();
        
        // Index event in Elasticsearch for searching
        await elasticsearch.index({
          index: `events-${timestamp.getFullYear()}.${timestamp.getMonth() + 1}`,
          document: {
            ...event,
            '@timestamp': timestamp,
          },
        });
        
      } catch (error) {
        console.error('Error processing event for analytics:', error);
      } finally {
        client.release();
      }
    },
  });
}

// Start the service
async function start() {
  try {
    await initializeKafka();
    const port = process.env.ANALYTICS_SERVICE_PORT || 3005;
    server.listen(port, () => {
      console.log(`Analytics service listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start analytics service:', error);
    process.exit(1);
  }
}

const server = createServer(app);
start();

import express from 'express';
import { createServer } from 'http';
import { Pool } from 'pg';
import { Kafka } from 'kafkajs';
import Redis from 'ioredis';
import mongoose from 'mongoose';

// PostgreSQL connection for commands
const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// MongoDB connection for queries
mongoose.connect(process.env.MONGODB_URL as string);

// Redis client
const redis = new Redis(process.env.REDIS_URL);

// Kafka setup
const kafka = new Kafka({
  clientId: 'identity-service',
  brokers: (process.env.KAFKA_BROKERS || '').split(','),
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'identity-service-group' });

const app = express();
const server = createServer(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Initialize Kafka producer and consumer
async function initializeKafka() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: 'coworker-platform.users.events' });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // Handle user events
      console.log({
        topic,
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      });
    },
  });
}

// Start the service
async function start() {
  try {
    await initializeKafka();
    const port = process.env.IDENTITY_SERVICE_PORT || 3001;
    server.listen(port, () => {
      console.log(`Identity service listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start identity service:', error);
    process.exit(1);
  }
}

start();

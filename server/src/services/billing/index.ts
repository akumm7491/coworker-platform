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
  clientId: 'billing-service',
  brokers: (process.env.KAFKA_BROKERS || '').split(','),
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'billing-service-group' });

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Subscription Commands (PostgreSQL)
app.post('/api/subscriptions', async (req, res) => {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    const { userId, planId, paymentMethodId } = req.body;
    
    // Create subscription in PostgreSQL
    const result = await client.query(
      'INSERT INTO subscriptions (user_id, plan_id, payment_method_id, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [userId, planId, paymentMethodId, 'active']
    );
    
    // Emit subscription.created event
    await producer.send({
      topic: 'coworker-platform.billing.events',
      messages: [{
        key: result.rows[0].id,
        value: JSON.stringify({
          type: 'subscription.created',
          data: { 
            id: result.rows[0].id, 
            userId, 
            planId, 
            paymentMethodId,
            status: 'active',
            createdAt: new Date().toISOString()
          },
          timestamp: new Date().toISOString(),
        }),
      }],
    });

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  } finally {
    client.release();
  }
});

// Invoice Generation Command
app.post('/api/invoices/generate', async (req, res) => {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    const { subscriptionId, amount, items } = req.body;
    
    // Create invoice in PostgreSQL
    const result = await client.query(
      'INSERT INTO invoices (subscription_id, amount, status, items) VALUES ($1, $2, $3, $4) RETURNING id',
      [subscriptionId, amount, 'pending', JSON.stringify(items)]
    );
    
    // Emit invoice.generated event
    await producer.send({
      topic: 'coworker-platform.billing.events',
      messages: [{
        key: result.rows[0].id,
        value: JSON.stringify({
          type: 'invoice.generated',
          data: { 
            id: result.rows[0].id, 
            subscriptionId, 
            amount, 
            items,
            status: 'pending',
            generatedAt: new Date().toISOString()
          },
          timestamp: new Date().toISOString(),
        }),
      }],
    });

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: 'Failed to generate invoice' });
  } finally {
    client.release();
  }
});

// Payment Processing Command
app.post('/api/payments/process', async (req, res) => {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    const { invoiceId, paymentMethodId, amount } = req.body;
    
    // TODO: Integrate with actual payment processor (Stripe, etc.)
    // This is a placeholder for the payment processing logic
    
    // Record payment in PostgreSQL
    const result = await client.query(
      'INSERT INTO payments (invoice_id, payment_method_id, amount, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [invoiceId, paymentMethodId, amount, 'completed']
    );
    
    // Update invoice status
    await client.query(
      'UPDATE invoices SET status = $1 WHERE id = $2',
      ['paid', invoiceId]
    );
    
    // Emit payment.processed event
    await producer.send({
      topic: 'coworker-platform.billing.events',
      messages: [{
        key: result.rows[0].id,
        value: JSON.stringify({
          type: 'payment.processed',
          data: { 
            id: result.rows[0].id, 
            invoiceId, 
            paymentMethodId, 
            amount,
            status: 'completed',
            processedAt: new Date().toISOString()
          },
          timestamp: new Date().toISOString(),
        }),
      }],
    });

    await client.query('COMMIT');
    res.json({ message: 'Payment processed successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  } finally {
    client.release();
  }
});

// Billing Queries (MongoDB)
app.get('/api/subscriptions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cacheKey = `subscriptions:${userId}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const subscriptions = await mongoose.model('Subscription').find({ userId })
      .populate('planId');
    
    await redis.set(cacheKey, JSON.stringify(subscriptions), 'EX', 300); // Cache for 5 minutes
    
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Initialize Kafka consumer
async function initializeKafka() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ 
    topics: [
      'coworker-platform.billing.events',
      'coworker-platform.users.events' // Listen for user events that might affect billing
    ]
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;
      
      const event = JSON.parse(message.value.toString());
      
      switch (event.type) {
        case 'subscription.created':
        case 'invoice.generated':
        case 'payment.processed':
          // Update read models in MongoDB
          await mongoose.model(event.type.split('.')[0].charAt(0).toUpperCase() + 
            event.type.split('.')[0].slice(1)).findOneAndUpdate(
            { _id: event.data.id },
            event.data,
            { upsert: true }
          );
          break;
          
        case 'user.deleted':
          // Handle user deletion
          await mongoose.model('Subscription').updateMany(
            { userId: event.data.id },
            { $set: { status: 'cancelled' } }
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
    const port = process.env.BILLING_SERVICE_PORT || 3004;
    server.listen(port, () => {
      console.log(`Billing service listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start billing service:', error);
    process.exit(1);
  }
}

const server = createServer(app);
start();

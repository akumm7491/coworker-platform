import express from 'express';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { createCollaborationRouter } from './routes/collaboration';
import { setupWebSockets } from './websockets';

const app = express();
const PORT = process.env.PORT || 3454;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Database connections
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Routes
app.use('/api', createCollaborationRouter(pool, redis));

// WebSocket setup
setupWebSockets(io, redis);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Collaboration service running on port ${PORT}`);
});

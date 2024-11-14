import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config/env';
import { setupWebSocketHandlers } from './sockets';
import agentRoutes from './routes/agents';
import projectRoutes from './routes/projects';
import { errorHandler } from './middleware/error';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: config.corsOrigins,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/agents', agentRoutes);
app.use('/api/projects', projectRoutes);

// WebSocket setup
setupWebSocketHandlers(io);

// Error handling
app.use(errorHandler);

export { app, httpServer, io };

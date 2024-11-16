import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config/env.js';
import { setupWebSocketHandlers } from './sockets/index.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import agentRoutes from './routes/agents.js';
import { errorHandler } from './middleware/error.js';
import { connectDB } from './config/database.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

const app = express();
const httpServer = createServer(app);

// Only connect to DB and setup WebSocket in non-test environment
if (process.env.NODE_ENV !== 'test') {
  // Connect to MongoDB
  connectDB();

  // Setup WebSocket
  const io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  // WebSocket setup
  setupWebSocketHandlers(io);
}

// Middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev')); // Add request logging in non-test environment
}

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Debug middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Body:', req.body);
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/agents', agentRoutes);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

export { app, httpServer };

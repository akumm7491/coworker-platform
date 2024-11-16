import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config/env.js';
import { setupWebSocketHandlers } from './sockets.js';
import authRoutes from './routes/auth.js';
import { errorHandler } from './middleware/error.js';
import { connectDB } from './config/database.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// Connect to MongoDB
connectDB();

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
app.use(morgan('dev')); // Add request logging

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Debug middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);

// WebSocket setup
setupWebSocketHandlers(io);

// Error handling middleware must be after all routes
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

// 404 handler must be after all routes
app.use((req: Request, res: Response) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    status: 'error',
    message: 'Not found'
  });
});

export { app, httpServer, io };

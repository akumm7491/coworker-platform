import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { createLogger } from './utils/logger.js';
import { configurePassport } from './config/passport.js';
import { initializeDatabase } from './config/database.js';
import agentRoutes from './routes/agents.js';
import projectRoutes from './routes/projects.js';
import analyticsRoutes from './routes/analytics.js';
import authRoutes from './routes/auth.js';

const logger = createLogger('app');
const app = express();

// Initialize database
initializeDatabase().catch(error => {
  logger.error('Failed to initialize database:', error);
  process.exit(1);
});

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Initialize passport
configurePassport(passport);
app.use(passport.initialize());

// Routes
app.use('/api/agents', agentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response) => {
  logger.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Not found',
  });
});

export default app;

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import { protect } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import analyticsRoutes from './routes/analytics.js';
import agentRoutes from './routes/agents.js';
import { securityHeaders } from './middleware/security.js';
import './config/passport.js';
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(passport.initialize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(securityHeaders);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', protect, projectRoutes);
app.use('/api/analytics', protect, analyticsRoutes);
app.use('/api/agents', protect, agentRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
  });
});

export default app;

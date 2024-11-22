import express, { Router } from 'express';
import cors from 'cors';
import { AppDataSource } from '../../config/database.js';
import { AuthController } from './controllers/authController.js';
import { UserService } from './services/userService.js';
import { User } from '../../models/User.js';
import { errorHandler } from '../../middleware/error.js';
import logger from '../../utils/logger.js';

const app = express();
const port = parseInt(process.env.PORT || '3451', 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'identity',
    database: AppDataSource.isInitialized ? 'connected' : 'disconnected',
  });
});

async function setupRoutes() {
  try {
    // Initialize services
    const userRepository = AppDataSource.getRepository(User);
    const userService = new UserService(userRepository);
    const authController = new AuthController(userService);

    // Routes
    const router = Router();
    router.post('/register', authController.register.bind(authController));
    router.post('/login', authController.login.bind(authController));
    router.post('/logout', authController.logout.bind(authController));
    router.get('/me', authController.getCurrentUser.bind(authController));

    app.use('/', router);
  } catch (error) {
    logger.error('Failed to setup routes:', error);
    throw error;
  }
}

async function startServer() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection established');

    // Setup routes
    await setupRoutes();

    // Add error handler middleware last
    app.use(errorHandler);

    // Start listening
    app.listen(port, () => {
      logger.info(`Identity service listening on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed');
    }
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the server
startServer();

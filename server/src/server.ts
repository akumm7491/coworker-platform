import 'reflect-metadata';
import { createServer } from 'http';
import app from './app.js';
import { config } from './config/env.js';
import logger from './utils/logger.js';
import { initializeDatabase } from './config/database.js';

const server = createServer(app);

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection:', { reason, promise });
  process.exit(1);
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    server.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`API URL: ${config.server.url}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default server;

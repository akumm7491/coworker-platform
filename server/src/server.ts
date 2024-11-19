import 'reflect-metadata';
import { createServer } from 'http';
import { config } from './config/env.js';
import logger from './utils/logger.js';
import { initializeDatabase } from './config/database.js';

// Initialize database and create app
async function initializeApp() {
  try {
    await initializeDatabase();
    const { default: app } = await import('./app.js');
    return app;
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    throw error;
  }
}

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

// Start server
async function startServer() {
  try {
    const app = await initializeApp();
    const server = createServer(app);
    
    server.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`API URL: ${config.server.url}`);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

const server = await startServer();
export default server;

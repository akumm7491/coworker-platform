import 'reflect-metadata';
import { createServer } from 'http';
import { config } from './config/env.js';
import logger from './utils/logger.js';
import { initializeDatabase } from './config/database.js';
import { initializeAgentSystem, shutdownAgentSystem } from './config/agent.js';

// Initialize database and create app
async function initializeApp() {
  try {
    await initializeDatabase();
    await initializeAgentSystem();
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

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      server.close(async () => {
        await shutdownAgentSystem();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

const server = await startServer();
export default server;

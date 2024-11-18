import { createServer } from 'http';
import app from './app.js';
import { config } from './config/env.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger('server');
const server = createServer(app);

const port = config.port || 3000;

server.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Handle SIGINT signal
process.on('SIGINT', () => {
  logger.info('SIGINT signal received');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

import winston from 'winston';
import { config } from '../config/env.js';

const { combine, timestamp, printf, colorize } = winston.format;

interface LoggerOptions {
  level: string;
  format: winston.Logform.Format;
  transports: winston.transport[];
}

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const defaultOptions: LoggerOptions = {
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    config.nodeEnv === 'development' ? colorize() : winston.format.uncolorize(),
    logFormat,
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
};

export function createLogger(name: string): winston.Logger {
  return winston.createLogger({
    ...defaultOptions,
    defaultMeta: { service: name },
  });
}

// Create default logger instance
const logger = createLogger('app');

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

export default logger;

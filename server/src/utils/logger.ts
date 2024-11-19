import winston from 'winston';
import { baseLogger } from './baseLogger.js';

const { combine, timestamp, printf, colorize } = winston.format;

// Re-export the baseLogger as the default logger
export default baseLogger;

// This function can be called after config is available to reconfigure the logger
export function configureLogger(nodeEnv: string): void {
  if (baseLogger.transports) {
    // Remove existing transports
    baseLogger.transports.forEach(t => baseLogger.remove(t));
  }

  // Add new transports with configuration
  baseLogger.add(
    new winston.transports.Console({
      level: nodeEnv === 'production' ? 'info' : 'debug',
      format: combine(
        timestamp(),
        nodeEnv === 'development' ? colorize() : winston.format.uncolorize(),
        printf(({ level, message, timestamp, ...metadata }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
          }
          return msg;
        }),
      ),
    }),
  );

  // Add file transport for errors
  baseLogger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
  );
}

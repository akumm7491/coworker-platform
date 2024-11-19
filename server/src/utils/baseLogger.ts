import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Create a basic logger with default settings
export const createBaseLogger = (name: string): winston.Logger => {
  return winston.createLogger({
    level: 'debug', // Default to debug level
    format: combine(timestamp(), colorize(), logFormat),
    transports: [new winston.transports.Console()],
    defaultMeta: { service: name },
  });
};

// Create and export a base logger instance
export const baseLogger = createBaseLogger('app');

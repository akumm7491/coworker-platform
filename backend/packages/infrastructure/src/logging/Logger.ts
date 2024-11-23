import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private logger: WinstonLogger;
  private context?: string;

  constructor() {
    this.logger = createLogger({
      format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
      transports: [
        new transports.Console({
          format: format.combine(format.colorize(), format.simple()),
        }),
      ],
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  private formatMessage(message: any, context?: string): string {
    const contextStr = context || this.context;
    return contextStr ? `[${contextStr}] ${message}` : message;
  }

  log(message: any, context?: string) {
    this.logger.info(this.formatMessage(message, context));
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(this.formatMessage(message, context), { trace });
  }

  warn(message: any, context?: string) {
    this.logger.warn(this.formatMessage(message, context));
  }

  debug(message: any, context?: string) {
    this.logger.debug(this.formatMessage(message, context));
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(this.formatMessage(message, context));
  }
}

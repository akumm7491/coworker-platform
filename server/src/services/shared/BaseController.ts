import { Response } from 'express';
import { ResponseHandler } from '../../utils/responseHandler.js';
import logger from '../../utils/logger.js';

interface LogMetadata {
  [key: string]: unknown;
}

export abstract class BaseController {
  protected logger = logger;

  protected sendSuccess<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200,
    meta?: LogMetadata,
  ): Response {
    return ResponseHandler.success(res, data, message, statusCode, meta);
  }

  protected sendError(
    res: Response,
    message: string | string[],
    statusCode: number = 400,
  ): Response {
    return ResponseHandler.error(res, message, statusCode);
  }

  protected sendCreated<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully',
  ): Response {
    return ResponseHandler.created(res, data, message);
  }

  protected sendNoContent(res: Response): Response {
    return ResponseHandler.noContent(res);
  }

  protected sendNotFound(res: Response, message: string = 'Resource not found'): Response {
    return ResponseHandler.notFound(res, message);
  }

  protected sendUnauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return ResponseHandler.unauthorized(res, message);
  }

  protected sendForbidden(res: Response, message: string = 'Forbidden'): Response {
    return ResponseHandler.forbidden(res, message);
  }

  protected sendBadRequest(res: Response, message: string | string[]): Response {
    return ResponseHandler.badRequest(res, message);
  }

  protected sendValidationError(res: Response, errors: string[]): Response {
    return ResponseHandler.validationError(res, errors);
  }

  protected logInfo(message: string, meta?: LogMetadata): void {
    this.logger.info(message, meta);
  }

  protected logError(message: string, error?: Error): void {
    this.logger.error(message, error);
  }

  protected logWarning(message: string, meta?: LogMetadata): void {
    this.logger.warn(message, meta);
  }

  protected logDebug(message: string, meta?: LogMetadata): void {
    this.logger.debug(message, meta);
  }
}

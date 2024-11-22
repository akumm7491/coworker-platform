import { Response } from 'express';

interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
}

export class ResponseHandler {
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200,
    meta?: ApiResponse<T>['meta'],
  ): Response {
    const response: ApiResponse<T> = {
      status: 'success',
      message,
      data,
      meta,
    };

    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string | string[], statusCode: number = 400): Response {
    const response: ApiResponse<null> = {
      status: 'error',
      errors: Array.isArray(message) ? message : [message],
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully',
  ): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return this.error(res, message, 404);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, 403);
  }

  static badRequest(res: Response, message: string | string[]): Response {
    return this.error(res, message, 400);
  }

  static validationError(res: Response, errors: string[]): Response {
    return this.error(res, errors, 422);
  }
}

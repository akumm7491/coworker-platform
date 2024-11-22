import { Request, Response, NextFunction } from 'express';
import { Schema } from 'zod';
import { AppError } from '../../middleware/error.js';
import { Repository } from 'typeorm';
import logger from '../../utils/logger.js';

export class MiddlewareFactory {
  static validate(schema: Schema) {
    return (req: Request, _res: Response, next: NextFunction) => {
      try {
        schema.parse({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        next();
      } catch (error: any) {
        next(new AppError(error.errors[0].message, 400));
      }
    };
  }

  static checkOwnership<T extends { ownerId: string }>(
    repository: Repository<T>,
    paramName = 'id',
  ) {
    return async (req: Request, _res: Response, next: NextFunction) => {
      try {
        const id = req.params[paramName];
        const entity = await repository.findOne({
          where: { id } as any,
        });

        if (!entity) {
          throw new AppError('Resource not found', 404);
        }

        if (entity.ownerId !== req.user!.id) {
          throw new AppError('Unauthorized access to this resource', 403);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  static rateLimiter(windowMs: number, maxRequests: number) {
    const requests = new Map<string, { count: number; startTime: number }>();

    return (req: Request, _res: Response, next: NextFunction) => {
      const ip = req.ip;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean up old entries
      requests.forEach((value, key) => {
        if (value.startTime < windowStart) {
          requests.delete(key);
        }
      });

      // Get or create request count for this IP
      const requestData = requests.get(ip) || { count: 0, startTime: now };

      // Reset if outside window
      if (requestData.startTime < windowStart) {
        requestData.count = 0;
        requestData.startTime = now;
      }

      // Increment request count
      requestData.count++;
      requests.set(ip, requestData);

      // Check if over limit
      if (requestData.count > maxRequests) {
        logger.warn(`Rate limit exceeded for IP: ${ip}`);
        throw new AppError('Too many requests', 429);
      }

      next();
    };
  }

  static asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  static requireRole(...roles: string[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const userRole = req.user.role;
      if (!roles.includes(userRole)) {
        throw new AppError('Insufficient permissions', 403);
      }

      next();
    };
  }

  static validateId(paramName = 'id') {
    return (req: Request, _res: Response, next: NextFunction) => {
      const id = req.params[paramName];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(id)) {
        throw new AppError('Invalid ID format', 400);
      }

      next();
    };
  }

  static logRequest() {
    return (req: Request, _res: Response, next: NextFunction) => {
      logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userId: req.user?.id,
      });
      next();
    };
  }
}

import { z } from 'zod';
import { AppError } from '../../../middleware/error.js';

export abstract class BaseValidator {
  protected static validate<T>(schema: z.Schema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError(error.errors[0].message, 400);
      }
      throw error;
    }
  }

  protected static commonSchemas = {
    id: z.string().uuid('Invalid ID format'),
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    url: z.string().url('Invalid URL format'),
    date: z.coerce.date(),
    pagination: z.object({
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['ASC', 'DESC']).optional(),
    }),
    metadata: z.record(z.string(), z.any()).optional(),
  };

  protected static createPaginatedResponse<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ) {
    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }
}

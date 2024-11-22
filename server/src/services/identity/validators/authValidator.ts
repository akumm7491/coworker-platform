import { z } from 'zod';
import { AppError } from '@/middleware/error.js';

// Registration validation schema
const registrationSchema = z
  .object({
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Login validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Password reset request validation schema
const passwordResetSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// New password validation schema
const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

class AuthValidator {
  public validateRegistration(data: unknown): void {
    try {
      registrationSchema.parse(data);
    } catch (error) {
      throw new AppError(400, error.errors[0].message);
    }
  }

  public validateLogin(data: unknown): void {
    try {
      loginSchema.parse(data);
    } catch (error) {
      throw new AppError(400, error.errors[0].message);
    }
  }

  public validatePasswordReset(data: unknown): void {
    try {
      passwordResetSchema.parse(data);
    } catch (error) {
      throw new AppError(400, error.errors[0].message);
    }
  }

  public validateNewPassword(data: unknown): void {
    try {
      newPasswordSchema.parse(data);
    } catch (error) {
      throw new AppError(400, error.errors[0].message);
    }
  }
}

export default new AuthValidator();

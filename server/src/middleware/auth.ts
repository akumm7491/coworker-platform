import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { config } from '../config/env.js';
import { AppError } from './error.js';
import logger from '../config/logger.js';
import { User } from '../models/User.js';

interface TokenPayload {
  id: string;
  email: string;
}

// Create JWT token
export const createToken = (userId: string): { accessToken: string; refreshToken: string } => {
  try {
    const payload = { id: userId };
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: '1h', // Short-lived access token
    });

    const refreshToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: '7d', // Longer-lived refresh token
    });

    return { accessToken, refreshToken };
  } catch (error) {
    logger.error('Error creating tokens:', error);
    throw new AppError('Error creating authentication tokens', 500);
  }
};

// Middleware to protect routes
export const protect = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: Error | null, user: User | false, info: { name?: string } | null) => {
      if (err) {
        logger.error('Auth error:', err);
        return next(new AppError('Authentication error', 401));
      }

      if (!user) {
        if (info instanceof Error) {
          if (info.name === 'TokenExpiredError') {
            return next(new AppError('Token expired', 401));
          }
          if (info.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid token', 401));
          }
        }
        return next(new AppError('Not authorized', 401));
      }

      req.user = user;
      next();
    },
  )(req, res, next);
};

// Middleware to authenticate login
export const authenticateLogin = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate(
    'local',
    { session: false },
    (err: Error | null, user: User | false, info: { message?: string } | null) => {
      if (err) {
        logger.error('Login error:', err);
        return next(new AppError('Login error', 500));
      }

      if (!user) {
        return next(new AppError(info?.message || 'Invalid credentials', 401));
      }

      req.user = user;
      next();
    },
  )(req, res, next);
};

// Middleware to refresh token
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.secret) as TokenPayload;

    // Create new tokens
    const tokens = createToken(decoded.id);

    res.json({
      success: true,
      tokens,
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Refresh token expired', 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid refresh token', 401));
    } else {
      next(error);
    }
  }
};

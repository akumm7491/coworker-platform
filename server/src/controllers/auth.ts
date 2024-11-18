import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../middleware/error.js';
import { createLogger } from '../utils/logger.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { AppDataSource } from '../config/database.js';
import { createToken } from '../middleware/auth.js';
import { UserProvider } from '../models/User.js';

const logger = createLogger('auth-controller');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Register request received:', { body: req.body });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation errors:', { errors: errors.array() });
      const validationErrors = errors.array().map(error => error.msg);
      throw new AppError(validationErrors[0], 400);
    }

    const { name, email, password } = req.body;
    const userRepository = AppDataSource.getCustomRepository(UserRepository);

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      logger.warn('User already exists:', { email });
      throw new AppError('User already exists', 400);
    }

    logger.info('Creating new user:', { name, email });

    // Create user
    const user = await userRepository.createUser({
      name,
      email,
      password,
      provider: UserProvider.LOCAL,
    });

    // Create tokens
    const tokens = createToken(user.id);

    logger.info('User created successfully:', {
      id: user.id,
      name: user.name,
      email: user.email,
    });

    // Return user data and tokens
    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    logger.error('Register error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Registration failed. Please try again.',
      });
    }
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Login request received:', { email: req.body.email });

    const { email, password } = req.body;
    const userRepository = AppDataSource.getCustomRepository(UserRepository);

    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      logger.warn('User not found:', { email });
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn('Invalid password:', { email });
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    user.updateLastLogin();
    await userRepository.save(user);

    // Create tokens
    const tokens = createToken(user.id);

    logger.info('User logged in successfully:', { id: user.id, email: user.email });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    logger.error('Login error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Login failed. Please try again.',
      });
    }
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const userRepository = AppDataSource.getCustomRepository(UserRepository);
    const user = await userRepository.findById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error('Get me error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to get user data. Please try again.',
      });
    }
  }
};

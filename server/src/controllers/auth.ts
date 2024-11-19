import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';  // Using bcrypt consistently
import { AppDataSource } from '../config/database.js';
import { User, UserProvider } from '../models/User.js';
import { AppError } from '../middleware/error.js';
import { catchAsync } from '../utils/catchAsync.js';
import { createToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const userRepository = AppDataSource.getRepository(User);

export const register = catchAsync(async (req: Request, res: Response) => {
  const { email, password, confirmPassword, name } = req.body;

  // Log input
  logger.info('Register attempt:', { email, name });

  // Validate input
  if (!email || !password || !name) {
    throw new AppError('Missing required fields', 400);
  }

  if (password !== confirmPassword) {
    throw new AppError('Passwords do not match', 400);
  }

  // Check if user already exists
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    // Log existing user's password hash for debugging
    logger.info('Existing user found:', { 
      email, 
      passwordHash: existingUser.password,
      userId: existingUser.id 
    });
    throw new AppError('User already exists', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  logger.info('Password hashed:', { email, passwordHash: hashedPassword });

  // Create new user
  const user = userRepository.create({
    email,
    password: hashedPassword,
    name,
    provider: UserProvider.LOCAL,
  });

  await userRepository.save(user);
  logger.info('User created:', { email, userId: user.id });

  // Create tokens
  const { accessToken, refreshToken } = createToken(user.id);

  res.status(201).json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  });
});

export const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError('Not authenticated', 401);
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database.js';
import { User, UserProvider } from '../models/User.js';
import { AppError } from '../middleware/error.js';
import { catchAsync } from '../utils/catchAsync.js';
import { createToken } from '../middleware/auth.js';

const userRepository = AppDataSource.getRepository(User);

export const register = catchAsync(async (req: Request, res: Response) => {
  const { email, password, confirmPassword, name } = req.body;

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
    throw new AppError('User already exists', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const user = userRepository.create({
    email,
    password: hashedPassword,
    name,
    provider: UserProvider.LOCAL,
  });

  await userRepository.save(user);

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

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new AppError('Missing required fields', 400);
  }

  // Find user
  const user = await userRepository.findOne({ where: { email } });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  // Create tokens
  const { accessToken, refreshToken } = createToken(user.id);

  res.json({
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
  // Since the protect middleware adds the user to req, we can just return it
  res.status(200).json(req.user);
});

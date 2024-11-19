import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database.js';
import { User } from '../models/User.js';
import { createToken, authenticateLogin, protect } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';
import logger from '../utils/logger.js';
import { getCurrentUser } from '../controllers/auth.js';

const router = Router();
const userRepository = AppDataSource.getRepository(User);

router.post(
  '/login',
  authenticateLogin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Authentication failed', 401);
      }

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
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  },
);

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      throw new AppError('Missing required fields', 400);
    }

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Create new user
    const user = userRepository.create({
      email,
      password,
      name,
    });

    await userRepository.save(user);

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
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
});

// Get current user
router.get('/me', protect, getCurrentUser);

export default router;

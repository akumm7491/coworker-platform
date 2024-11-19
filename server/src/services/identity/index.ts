import logger from '../../utils/logger.js';
import { getRepository } from 'typeorm';
import { User, UserProvider } from '../../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { AppError } from '../../middleware/error.js';


interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegistrationData {
  email: string;
  password: string;
  name: string;
}

class IdentityService {
  async login({ email, password }: LoginCredentials): Promise<{ user: User; tokens: TokenPair }> {
    try {
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      const tokens = this.generateTokens(user.id);
      logger.info(`User logged in successfully: ${user.id}`);
      return { user, tokens };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  async register(data: RegistrationData): Promise<{ user: User; tokens: TokenPair }> {
    try {
      const userRepository = getRepository(User);
      const existingUser = await userRepository.findOne({ where: { email: data.email } });
      if (existingUser) {
        throw new AppError('Email already registered', 400);
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = userRepository.create({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        emailVerified: false,
        provider: UserProvider.LOCAL,
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            desktop: true,
          },
          language: 'en',
          timezone: 'UTC',
        },
        activity: {
          lastLogin: new Date(),
          lastActive: new Date(),
          projectActivity: [],
          agentActivity: [],
        },
      });

      await userRepository.save(user);
      const tokens = this.generateTokens(user.id);
      logger.info(`User registered successfully: ${user.id}`);
      return { user, tokens };
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as { id: string };
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: decoded.id } });

      if (!user) {
        throw new AppError('Invalid refresh token', 401);
      }

      const tokens = this.generateTokens(user.id);
      logger.info(`Tokens refreshed for user: ${user.id}`);
      return tokens;
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async validateToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: decoded.id } });

      if (!user) {
        throw new AppError('Invalid token', 401);
      }

      return user;
    } catch (error) {
      logger.error('Token validation failed:', error);
      throw new AppError('Invalid token', 401);
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', 401);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await userRepository.save(user);
      logger.info(`Password changed for user: ${userId}`);
    } catch (error) {
      logger.error('Password change failed:', error);
      throw error;
    }
  }

  private generateTokens(userId: string): TokenPair {
    const accessToken = jwt.sign({ id: userId }, config.jwt.secret, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ id: userId }, config.jwt.secret, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}

export const identityService = new IdentityService();

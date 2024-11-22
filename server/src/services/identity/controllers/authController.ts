import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { catchAsync } from '../../../utils/catchAsync.js';
import { TokenService } from '../services/tokenService.js';
import { UserService } from '../services/userService.js';
import { AppError } from '../../../middleware/error.js';
import logger from '../../../utils/logger.js';
import { validateRegistration, validateLogin, validatePasswordReset, validateNewPassword } from '../validators/authValidator.js';
import { User } from '../../../services/shared/database/entities/User.js';

export class AuthController {
  constructor(private userService: UserService) {}

  register = catchAsync(async (req: Request, res: Response) => {
    const { email, password, confirmPassword, name } = req.body;

    // Validate input
    validateRegistration(req.body);

    // Create new user
    const user = await this.userService.createUser({
      email,
      password,
      name,
      provider: User.Provider.LOCAL,
    });

    // Generate token
    const token = TokenService.createToken(user);

    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validate input
    validateLogin(req.body);

    // Find user
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Validate password
    const isValidPassword = await this.userService.validatePassword(user, password);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate token
    const token = TokenService.createToken(user);

    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });
  });

  resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    // Validate input
    validatePasswordReset(req.body);

    // Find user
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      res.status(200).json({
        status: 'success',
        message: 'If a user with that email exists, a password reset link has been sent.',
      });
      return;
    }

    // TODO: Implement password reset email functionality
    logger.info(`Password reset requested for user: ${user.id}`);

    res.status(200).json({
      status: 'success',
      message: 'If a user with that email exists, a password reset link has been sent.',
    });
  });

  updatePassword = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { password, confirmPassword } = req.body;

    // Validate input
    validateNewPassword(req.body);

    // Update password
    await this.userService.updatePassword(parseInt(userId), password);

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  });
}

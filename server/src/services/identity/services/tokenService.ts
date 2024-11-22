import jwt from 'jsonwebtoken';
import { User } from '../../../services/shared/database/entities/User.js';
import { AppError } from '../../../middleware/error.js';
import logger from '../../../utils/logger.js';

export class TokenService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly JWT_EXPIRES_IN = '24h';

  static createToken(user: User): string {
    try {
      return jwt.sign(
        { id: user.id, email: user.email },
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN }
      );
    } catch (error) {
      logger.error('Error creating token:', error);
      throw new AppError(500, 'Error creating authentication token');
    }
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      logger.error('Error verifying token:', error);
      throw new AppError(401, 'Invalid or expired token');
    }
  }

  static createPasswordResetToken(userId: number): string {
    try {
      const token = jwt.sign({ userId }, this.JWT_SECRET, { expiresIn: '1h' });
      return token;
    } catch (error) {
      logger.error('Error creating password reset token:', error);
      throw new AppError(500, 'Error creating password reset token');
    }
  }

  static verifyPasswordResetToken(token: string): number {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as jwt.JwtPayload & { userId: number };
      return decoded.userId;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(401, 'Password reset token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(401, 'Invalid password reset token');
      }
      logger.error('Error verifying password reset token:', error);
      throw new AppError(500, 'Error verifying password reset token');
    }
  }
}

// Export singleton instance
export const tokenService = new TokenService();

// Export createToken function for backward compatibility
export function createToken(user: User): string {
  return TokenService.createToken(user);
}

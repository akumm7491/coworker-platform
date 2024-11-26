import { Injectable } from '@nestjs/common';
import { JWTService } from '@coworker/shared-kernel';
import { User } from '../domain/models/User';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { PasswordHashingService } from '../application/services/PasswordHashingService';
import { Result } from '@coworker/shared-kernel';
import { AuthenticationError } from '@coworker/shared-kernel';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JWTService,
    private readonly passwordHashingService: PasswordHashingService
  ) {}

  async validateUser(email: string, password: string): Promise<Result<User>> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return Result.fail(new AuthenticationError('User not found'));
    }

    try {
      await user.verifyPassword(password, this.passwordHashingService);
      return Result.ok(user);
    } catch (error) {
      if (error instanceof Error) {
        return Result.fail(error);
      }
      return Result.fail(new AuthenticationError('Invalid credentials'));
    }
  }

  async validateUserById(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    return user;
  }

  async generateUserToken(user: User): Promise<any> {
    return this.jwtService.generateTokens({
      id: user.id,
      email: user.getEmail(),
      roles: user.getRoles(),
      permissions: user.permissions,
      metadata: {},
    });
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { JWTService } from '@coworker/shared-kernel';
import { User } from '../domain/models/User';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { PasswordHashingService } from '../application/services/PasswordHashingService';
import { Result } from '@coworker/shared-kernel';
import { AuthenticationError } from '@coworker/shared-kernel';
import { USER_REPOSITORY } from '../domain/repositories/tokens';
import { IAuthToken, IAuthUser } from '@coworker/shared-kernel';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
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

  async generateUserToken(user: User): Promise<Result<IAuthToken>> {
    const authUser: IAuthUser = {
      id: user.id,
      email: user.getEmail(),
      roles: user.getRoles(),
      permissions: user.getPermissions(),
      metadata: {},
    };

    const tokenResult = await this.jwtService.generateTokens(authUser);
    if (tokenResult.isFail()) {
      return Result.fail(tokenResult.getError());
    }

    return Result.ok(tokenResult.getValue());
  }

  async login(email: string, password: string): Promise<Result<IAuthToken>> {
    const userResult = await this.validateUser(email, password);
    if (userResult.isFail()) {
      return Result.fail(userResult.getError());
    }

    return this.generateUserToken(userResult.getValue());
  }
}

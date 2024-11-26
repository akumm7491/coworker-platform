import { Injectable } from '@nestjs/common';
import { JWTService, Result, IAuthToken, AuthenticationError } from '@coworker/shared-kernel';
import { User, UserId } from '../../domain/models/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { PasswordHashingService } from './PasswordHashingService';
import {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  UserNotFoundError,
} from '../../domain/errors/UserErrors';
import * as crypto from 'crypto';
import { IEventBus } from '@coworker/shared-kernel';

interface RegisterUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

interface SocialLoginDTO {
  provider: 'google' | 'github';
  profileId: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JWTService,
    private readonly passwordHashingService: PasswordHashingService,
    private readonly eventBus: IEventBus
  ) {}

  async register(dto: RegisterUserDTO): Promise<Result<IAuthToken>> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      return Result.fail(new UserAlreadyExistsError(dto.email));
    }

    const [user, event] = await User.create(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
      this.passwordHashingService
    );

    await this.userRepository.save(user);
    await this.eventBus.publish(event);

    const tokens = await this.jwtService.generateTokens({
      id: user.id,
      email: user.getEmail(),
      roles: user.getRoles(),
      permissions: user.permissions,
      metadata: {},
    });

    return tokens.isOk()
      ? tokens
      : Result.fail(new AuthenticationError('Failed to generate tokens'));
  }

  async login(dto: LoginDTO): Promise<Result<IAuthToken>> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      return Result.fail(new InvalidCredentialsError());
    }

    try {
      await user.verifyPassword(dto.password, this.passwordHashingService);
    } catch (error) {
      return Result.fail(new InvalidCredentialsError());
    }

    const tokens = await this.jwtService.generateTokens({
      id: user.id,
      email: user.getEmail(),
      roles: user.getRoles(),
      permissions: user.permissions,
      metadata: {},
    });

    return tokens.isOk()
      ? tokens
      : Result.fail(new AuthenticationError('Failed to generate tokens'));
  }

  async socialLogin(dto: SocialLoginDTO): Promise<Result<IAuthToken>> {
    let user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      const [newUser, event] = await User.create(
        dto.email,
        crypto.randomBytes(32).toString('hex'), // Generate a random password for social login
        dto.firstName,
        dto.lastName,
        this.passwordHashingService
      );

      user = newUser;
      await this.userRepository.save(user);
      await this.eventBus.publish(event);
    }

    const tokens = await this.jwtService.generateTokens({
      id: user.id,
      email: user.getEmail(),
      roles: user.getRoles(),
      permissions: user.permissions,
      metadata: {
        provider: dto.provider,
        profileId: dto.profileId,
      },
    });

    return tokens.isOk()
      ? tokens
      : Result.fail(new AuthenticationError('Failed to generate tokens'));
  }

  async findById(id: UserId): Promise<Result<User>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return Result.fail(new UserNotFoundError(id));
    }
    return Result.ok(user);
  }

  async validateToken(token: string): Promise<Result<any>> {
    try {
      const result = await this.jwtService.validateToken(token);
      return result.isOk() ? result : Result.fail(new AuthenticationError('Invalid token'));
    } catch (error) {
      return Result.fail(new AuthenticationError('Invalid token'));
    }
  }

  async resetPassword(userId: UserId, newPassword: string): Promise<Result<void>> {
    const userResult = await this.findById(userId);
    if (userResult.isFail()) {
      return Result.fail(userResult.getError());
    }

    const user = userResult.getValue();
    const event = await user.changePassword(newPassword, this.passwordHashingService);

    await this.userRepository.save(user);
    await this.eventBus.publish(event);
    return Result.ok(void 0);
  }

  async getUserById(id: string): Promise<User | null> {
    const userResult = await this.findById(id);
    return userResult.isOk() ? userResult.getValue() : null;
  }
}

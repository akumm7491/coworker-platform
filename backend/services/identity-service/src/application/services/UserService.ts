import { Injectable } from '@nestjs/common';
import { JWTService } from '@shared-kernel/domain/auth/services/JWTService';
import { Result } from '@shared-kernel/common/Result';
import { User, UserId } from '../../domain/models/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { PasswordHashingService } from './PasswordHashingService';
import {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  UserNotFoundError,
} from '../../domain/errors/UserErrors';
import { IAuthToken } from '@shared-kernel/domain/auth/types/auth.types';
import { AuthenticationError } from '@shared-kernel/domain/auth';

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
    private readonly passwordHashingService: PasswordHashingService
  ) {}

  async register(dto: RegisterUserDTO): Promise<Result<IAuthToken>> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      return Result.fail(new UserAlreadyExistsError(dto.email));
    }

    const hashedPassword = await this.passwordHashingService.hash(dto.password);
    const user = User.create({
      email: dto.email,
      passwordHash: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      metadata: {
        registrationDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
      },
    });

    await this.userRepository.save(user);

    const tokenResult = await this.jwtService.generateTokens({
      id: user.id,
      email: user.email,
      roles: user.roles,
      permissions: [],
      metadata: user.metadata,
    });

    if (tokenResult.isFail()) {
      const error = tokenResult.getError();
      return Result.fail(new AuthenticationError(error.message));
    }

    return Result.ok(tokenResult.getValue());
  }

  async login(dto: LoginDTO): Promise<Result<IAuthToken>> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      return Result.fail(new InvalidCredentialsError());
    }

    const isPasswordValid = await user.validatePassword(dto.password, this.passwordHashingService);
    if (!isPasswordValid) {
      return Result.fail(new InvalidCredentialsError());
    }

    const tokenResult = await this.jwtService.generateTokens({
      id: user.id,
      email: user.email,
      roles: user.roles,
      permissions: [],
      metadata: user.metadata,
    });

    if (tokenResult.isFail()) {
      const error = tokenResult.getError();
      return Result.fail(new AuthenticationError(error.message));
    }

    return Result.ok(tokenResult.getValue());
  }

  async socialLogin(dto: SocialLoginDTO): Promise<Result<IAuthToken>> {
    let user = await this.userRepository.findBySocialProfile(dto.provider, dto.profileId);

    if (!user) {
      user = await this.userRepository.findByEmail(dto.email);
      if (user) {
        // Link social profile to existing user
        user.linkSocialProfile(dto.provider, {
          id: dto.profileId,
          email: dto.email,
        });
      } else {
        // Create new user with social profile
        user = User.createWithSocialProfile(dto.provider, {
          id: dto.profileId,
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
        });
      }
      await this.userRepository.save(user);
    }

    const tokenResult = await this.jwtService.generateTokens({
      id: user.id,
      email: user.email,
      roles: user.roles,
      permissions: [],
      metadata: user.metadata,
    });

    if (tokenResult.isFail()) {
      const error = tokenResult.getError();
      return Result.fail(new AuthenticationError(error.message));
    }

    return Result.ok(tokenResult.getValue());
  }

  async resetPassword(userId: UserId, newPassword: string): Promise<Result<void>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return Result.fail(new UserNotFoundError(userId));
    }

    await user.setPassword(newPassword, this.passwordHashingService);
    await this.userRepository.save(user);

    return Result.ok(undefined);
  }

  async getUserById(userId: UserId): Promise<Result<User>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return Result.fail(new UserNotFoundError(userId));
    }
    return Result.ok(user);
  }
}

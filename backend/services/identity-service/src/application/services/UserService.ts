import { Injectable, Inject } from '@nestjs/common';
import { JWTService } from '@coworker/shared-kernel';
import { User } from '../../domain/models/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { PasswordHashingService } from './PasswordHashingService';
import { Result } from '@coworker/shared-kernel';
import { IEventBus } from '@coworker/shared-kernel';
import { USER_REPOSITORY } from '../../domain/repositories/tokens';
import { UserAlreadyExistsError, UserNotFoundError } from '../../domain/errors/UserErrors';
import { IAuthToken, IAuthUser } from '@coworker/shared-kernel';
import * as crypto from 'crypto';

interface RegisterUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface SocialProfile {
  provider: 'google' | 'github';
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
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

    const authUser: IAuthUser = {
      id: user.id,
      email: user.getEmail(),
      roles: user.getRoles(),
      permissions: user.getPermissions(),
      metadata: {},
    };

    const token: IAuthToken = {
      accessToken: (await this.jwtService.generateTokens(authUser)).getValue().accessToken,
      refreshToken: crypto.randomBytes(32).toString('hex'),
      expiresIn: 3600,
      tokenType: 'Bearer',
    };

    return Result.ok(token);
  }

  async findById(id: string): Promise<Result<User>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return Result.fail(new UserNotFoundError(id));
    }
    return Result.ok(user);
  }

  async resetPassword(email: string): Promise<Result<void>> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return Result.fail(new UserNotFoundError(email));
    }

    const newPassword = crypto.randomBytes(8).toString('hex');
    const event = await user.changePassword(newPassword, this.passwordHashingService);

    await this.userRepository.save(user);
    await this.eventBus.publish(event);

    return Result.ok(void 0);
  }

  async getUserById(id: string): Promise<Result<User>> {
    return this.findById(id);
  }

  async findOrCreateSocialUser(profile: SocialProfile): Promise<User> {
    let user = await this.userRepository.findBySocialProfile(profile.provider, profile.id);

    if (!user) {
      user = await this.userRepository.findByEmail(profile.email);
    }

    if (!user) {
      const [newUser, event] = await User.create(
        profile.email,
        crypto.randomBytes(32).toString('hex'),
        profile.firstName || '',
        profile.lastName || '',
        this.passwordHashingService
      );

      await this.userRepository.save(newUser);
      await this.eventBus.publish(event);

      user = newUser;
    }

    return user;
  }
}

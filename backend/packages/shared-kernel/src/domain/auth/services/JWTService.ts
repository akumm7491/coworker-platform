import { Inject, Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { Result } from '../../../common/Result';
import { IAuthToken, IAuthUser } from '../types/auth.types';
import { AuthenticationError } from '../errors/AuthErrors';
import { JWT_CONFIG, JWTConfig } from '../config/JWTConfig';
import { TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class JWTService {
  constructor(
    private readonly jwtService: NestJwtService,
    @Inject(JWT_CONFIG) private readonly config: JWTConfig
  ) {}

  async generateTokens(user: IAuthUser): Promise<Result<IAuthToken>> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
          {
            sub: user.id,
            email: user.email,
            roles: user.roles,
            permissions: user.permissions,
          },
          {
            secret: this.config.secret,
            expiresIn: this.config.accessTokenExpiresIn,
          }
        ),
        this.jwtService.signAsync(
          {
            sub: user.id,
            type: 'refresh',
          },
          {
            secret: this.config.secret,
            expiresIn: this.config.refreshTokenExpiresIn,
          }
        ),
      ]);

      return Result.ok({
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: parseInt(this.config.accessTokenExpiresIn),
      });
    } catch (error) {
      return Result.fail(new AuthenticationError('Failed to generate tokens'));
    }
  }

  async validateToken(token: string): Promise<Result<IAuthUser>> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.secret,
      });

      if (payload.type === 'refresh') {
        return Result.fail(AuthenticationError.invalidToken());
      }

      const user: IAuthUser = {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles,
        permissions: payload.permissions,
        metadata: payload.metadata || {},
      };

      return Result.ok(user);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return Result.fail(AuthenticationError.tokenExpired());
      }
      return Result.fail(AuthenticationError.invalidToken());
    }
  }

  async validateRefreshToken(token: string): Promise<Result<string>> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.secret,
      });

      if (payload.type !== 'refresh') {
        return Result.fail(AuthenticationError.invalidToken());
      }

      return Result.ok(payload.sub);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return Result.fail(AuthenticationError.tokenExpired());
      }
      return Result.fail(AuthenticationError.invalidToken());
    }
  }
}

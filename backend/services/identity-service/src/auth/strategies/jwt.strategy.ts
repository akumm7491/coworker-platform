import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWTService } from '@coworker/shared-kernel';
import { AuthenticationError } from '@coworker/shared-kernel';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly jwtService: JWTService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (
        request: any,
        rawJwtToken: string,
        done: (err: any, secret: string) => void
      ) => {
        const result = await this.jwtService.validateToken(rawJwtToken);
        if (result.isFail()) {
          done(
            new AuthenticationError('Invalid token'),
            process.env.JWT_SECRET || 'your-secret-key'
          );
          return;
        }
        done(null, process.env.JWT_SECRET || 'your-secret-key');
      },
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  }
}

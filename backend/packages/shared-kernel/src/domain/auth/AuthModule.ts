import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JWTService } from './services/JWTService';
import { JWT_CONFIG, JWTConfig } from './config/JWTConfig';

export interface AuthModuleOptions {
  jwt: JWTConfig;
}

@Module({})
export class AuthModule {
  static register(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        JwtModule.register({
          secret: options.jwt.secret,
          signOptions: {
            expiresIn: options.jwt.accessTokenExpiresIn,
          },
        }),
      ],
      providers: [
        {
          provide: JWT_CONFIG,
          useValue: options.jwt,
        },
        JWTService,
      ],
      exports: [JWTService],
    };
  }
}

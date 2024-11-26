import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './application/services/UserService';
import { AuthController } from './infrastructure/controllers/AuthController';
import { GoogleStrategy } from './infrastructure/auth/GoogleStrategy';
import { GithubStrategy } from './infrastructure/auth/GithubStrategy';
import { JwtStrategy } from './infrastructure/auth/JwtStrategy';
import { JWTService } from '@coworker/shared-kernel';
import { PasswordHashingService } from './application/services/PasswordHashingService';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    UserService,
    JWTService,
    GoogleStrategy,
    GithubStrategy,
    JwtStrategy,
    PasswordHashingService,
  ],
  exports: [UserService],
})
export class IdentityModule {}

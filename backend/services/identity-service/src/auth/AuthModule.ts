import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './AuthController';
import { AuthService } from './AuthService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../domain/models/User';
import { UserModule } from '../UserModule';
import { AuthModule as SharedAuthModule } from '@coworker/shared-kernel';

@Module({
  imports: [
    PassportModule,
    SharedAuthModule.register({
      jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        accessTokenExpiresIn: '1h',
        refreshTokenExpiresIn: '7d',
      },
    }),
    TypeOrmModule.forFeature([User]),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

import { InjectionToken } from '@nestjs/common';

export interface JWTConfig {
  secret: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

export const JWT_CONFIG = new InjectionToken<JWTConfig>('JWT_CONFIG');

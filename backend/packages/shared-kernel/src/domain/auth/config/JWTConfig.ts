import { Inject } from '@nestjs/common';

export interface JWTConfig {
  secret: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

export const JWT_CONFIG = 'JWT_CONFIG';
export const InjectJWTConfig = () => Inject(JWT_CONFIG);

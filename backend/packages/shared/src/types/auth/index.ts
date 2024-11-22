import { Request } from 'express';
import { BaseEntity } from '../common';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  password?: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: Omit<User, 'password'>;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: User;
}

import { Result } from '../../../common/Result';

export type UserId = string;
export type UserEmail = string;
export type RoleName = string;
export type PermissionName = string;

export interface IAuthUser {
  id: UserId;
  email: UserEmail;
  roles: RoleName[];
  permissions: PermissionName[];
  metadata: Record<string, any>;
}

export interface IAuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface IAuthenticationResult {
  user: IAuthUser;
  token: IAuthToken;
}

export interface IAuthCredentials {
  email: string;
  password: string;
}

export interface ISocialAuthCredentials {
  provider: string;
  token: string;
  userData?: Record<string, any>;
}

export interface IAuthProvider {
  authenticate(
    credentials: IAuthCredentials | ISocialAuthCredentials
  ): Promise<Result<IAuthenticationResult>>;
  validateToken(token: string): Promise<Result<IAuthUser>>;
  refreshToken(token: string): Promise<Result<IAuthToken>>;
}

export interface IAuthService {
  login(credentials: IAuthCredentials): Promise<Result<IAuthenticationResult>>;
  socialLogin(credentials: ISocialAuthCredentials): Promise<Result<IAuthenticationResult>>;
  logout(userId: UserId): Promise<Result<void>>;
  validateSession(token: string): Promise<Result<IAuthUser>>;
  refreshSession(token: string): Promise<Result<IAuthToken>>;
}

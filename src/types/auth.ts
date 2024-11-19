export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  avatar?: string;
  provider?: 'local' | 'google' | 'github';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  user: AuthUser;
  tokens: AuthTokens;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name: string;
  confirmPassword: string;
}

export interface OAuthCallbackParams {
  accessToken?: string;
  refreshToken?: string;
  user?: string;
  error?: string;
}

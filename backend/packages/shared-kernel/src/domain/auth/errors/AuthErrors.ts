import { DomainError } from '../../errors/DomainError';

export class AuthenticationError extends DomainError {
  constructor(message: string) {
    super(message);
  }

  static invalidCredentials(): AuthenticationError {
    return new AuthenticationError('Invalid credentials provided');
  }

  static tokenExpired(): AuthenticationError {
    return new AuthenticationError('Authentication token has expired');
  }

  static invalidToken(): AuthenticationError {
    return new AuthenticationError('Invalid authentication token');
  }

  static userNotFound(): AuthenticationError {
    return new AuthenticationError('User not found');
  }
}

export class AuthorizationError extends DomainError {
  constructor(message: string) {
    super(message);
  }

  static insufficientPermissions(): AuthorizationError {
    return new AuthorizationError('Insufficient permissions to perform this action');
  }

  static roleRequired(role: string): AuthorizationError {
    return new AuthorizationError(`Role ${role} is required to perform this action`);
  }

  static permissionRequired(permission: string): AuthorizationError {
    return new AuthorizationError(`Permission ${permission} is required to perform this action`);
  }
}

export class SocialAuthError extends DomainError {
  constructor(message: string) {
    super(message);
  }

  static providerNotSupported(provider: string): SocialAuthError {
    return new SocialAuthError(`Social auth provider ${provider} is not supported`);
  }

  static invalidProviderToken(): SocialAuthError {
    return new SocialAuthError('Invalid social provider token');
  }
}

import { DomainError } from '@coworker/shared-kernel';

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsError';
  }
}

export class UserNotFoundError extends DomainError {
  constructor(identifier?: string) {
    super(identifier ? `User not found: ${identifier}` : 'User not found');
    this.name = 'UserNotFoundError';
  }
}

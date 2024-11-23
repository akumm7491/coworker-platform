import { Result } from '../../common/Result';
import { ValidationError } from '../../common/errors/DomainError';

export class Email {
  private constructor(public readonly value: string) {}

  public static create(email: string): Result<Email, ValidationError> {
    if (!email) {
      return Result.fail(new ValidationError('Email cannot be empty'));
    }

    if (!email.includes('@')) {
      return Result.fail(new ValidationError('Invalid email format'));
    }

    return Result.ok(new Email(email.toLowerCase()));
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}

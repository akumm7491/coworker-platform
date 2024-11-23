import { ValueObject } from '../base/ValueObject';
import { ValidationError } from '../errors/DomainError';

interface EmailProps {
  value: string;
}

/**
 * Email value object with validation
 * Ensures email addresses follow a valid format
 */
export class Email extends ValueObject<EmailProps> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(props: EmailProps) {
    super(props);
  }

  public static create(email: string): Email {
    if (!email) {
      throw new ValidationError('Email cannot be empty');
    }

    if (!this.EMAIL_REGEX.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    return new Email({ value: email });
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.value;
  }
}

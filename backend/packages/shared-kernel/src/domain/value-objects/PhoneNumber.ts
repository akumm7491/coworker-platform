import { ValidationError } from '../errors/DomainError';
import { ValueObject } from '../base/ValueObject';

interface PhoneNumberProps {
  value: string;
  countryCode?: string;
}

/**
 * Represents a phone number value object with validation
 */
export class PhoneNumber extends ValueObject<PhoneNumberProps> {
  private static readonly PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

  private constructor(props: PhoneNumberProps) {
    super(props);
  }

  public static create(props: PhoneNumberProps): PhoneNumber {
    PhoneNumber.validate(props);
    return new PhoneNumber(props);
  }

  private static validate(props: PhoneNumberProps): void {
    if (!props.value) {
      throw new ValidationError('Phone number cannot be empty');
    }

    // Remove any non-digit characters except +
    const cleanNumber = props.value.replace(/[^\d+]/g, '');

    if (!this.PHONE_REGEX.test(cleanNumber)) {
      throw new ValidationError('Invalid phone number format');
    }

    if (props.countryCode && !/^\+?\d{1,3}$/.test(props.countryCode)) {
      throw new ValidationError('Invalid country code');
    }
  }

  public get value(): string {
    return this.props.value;
  }

  public get countryCode(): string | undefined {
    return this.props.countryCode;
  }

  public format(): string {
    if (this.props.countryCode) {
      return `${this.props.countryCode} ${this.props.value}`;
    }
    return this.props.value;
  }

  public equals(other: PhoneNumber): boolean {
    if (!(other instanceof PhoneNumber)) {
      return false;
    }
    return (
      this.props.value === other.props.value && this.props.countryCode === other.props.countryCode
    );
  }

  public toString(): string {
    return this.format();
  }
}

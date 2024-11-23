import { ValidationError } from '../errors/DomainError';
import { ValueObject } from '../base/ValueObject';

interface MoneyProps {
  amount: number;
  currency: string;
}

/**
 * Represents a monetary value with currency
 */
export class Money extends ValueObject<MoneyProps> {
  private static readonly CURRENCY_REGEX = /^[A-Z]{3}$/;
  private static readonly SUPPORTED_CURRENCIES = new Set([
    'USD',
    'EUR',
    'GBP',
    'JPY',
    'CAD',
    'AUD',
    'CHF',
  ]);

  private constructor(props: MoneyProps) {
    super(props);
  }

  public static create(props: MoneyProps): Money {
    Money.validate(props);
    return new Money(props);
  }

  private static validate(props: MoneyProps): void {
    if (typeof props.amount !== 'number' || isNaN(props.amount)) {
      throw new ValidationError('Amount must be a valid number');
    }

    if (!props.currency || !this.CURRENCY_REGEX.test(props.currency)) {
      throw new ValidationError('Currency must be a valid 3-letter ISO code');
    }

    if (!this.SUPPORTED_CURRENCIES.has(props.currency)) {
      throw new ValidationError(`Currency ${props.currency} is not supported`);
    }
  }

  public get amount(): number {
    return this.props.amount;
  }

  public get currency(): string {
    return this.props.currency;
  }

  public add(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new ValidationError('Cannot add money with different currencies');
    }
    return Money.create({
      amount: this.amount + other.amount,
      currency: this.currency,
    });
  }

  public subtract(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new ValidationError('Cannot subtract money with different currencies');
    }
    return Money.create({
      amount: this.amount - other.amount,
      currency: this.currency,
    });
  }

  public multiply(multiplier: number): Money {
    if (typeof multiplier !== 'number' || isNaN(multiplier)) {
      throw new ValidationError('Multiplier must be a valid number');
    }
    return Money.create({
      amount: this.amount * multiplier,
      currency: this.currency,
    });
  }

  public equals(other: Money): boolean {
    if (!(other instanceof Money)) {
      return false;
    }
    return this.amount === other.amount && this.currency === other.currency;
  }

  public format(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }

  public toString(): string {
    return this.format();
  }
}

import { ValidationError } from '../errors/DomainError';
import { ValueObject } from '../base/ValueObject';

interface DateRangeProps {
  start: Date;
  end: Date;
}

/**
 * Represents a date range with validation and operations
 */
export class DateRange extends ValueObject<DateRangeProps> {
  private constructor(props: DateRangeProps) {
    super(props);
  }

  public static create(props: DateRangeProps): DateRange {
    DateRange.validate(props);
    return new DateRange(props);
  }

  private static validate(props: DateRangeProps): void {
    if (!(props.start instanceof Date) || isNaN(props.start.getTime())) {
      throw new ValidationError('Start date must be a valid Date object');
    }

    if (!(props.end instanceof Date) || isNaN(props.end.getTime())) {
      throw new ValidationError('End date must be a valid Date object');
    }

    if (props.end < props.start) {
      throw new ValidationError('End date cannot be before start date');
    }
  }

  public get start(): Date {
    return new Date(this.props.start);
  }

  public get end(): Date {
    return new Date(this.props.end);
  }

  public get durationInDays(): number {
    const diffTime = Math.abs(this.end.getTime() - this.start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public overlaps(other: DateRange): boolean {
    return this.start <= other.end && this.end >= other.start;
  }

  public contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  public containsRange(other: DateRange): boolean {
    return this.start <= other.start && this.end >= other.end;
  }

  public intersection(other: DateRange): DateRange | null {
    if (!this.overlaps(other)) {
      return null;
    }

    const start = new Date(Math.max(this.start.getTime(), other.start.getTime()));
    const end = new Date(Math.min(this.end.getTime(), other.end.getTime()));

    return DateRange.create({ start, end });
  }

  public union(other: DateRange): DateRange | null {
    if (!this.overlaps(other)) {
      return null;
    }

    const start = new Date(Math.min(this.start.getTime(), other.start.getTime()));
    const end = new Date(Math.max(this.end.getTime(), other.end.getTime()));

    return DateRange.create({ start, end });
  }

  public equals(other: DateRange): boolean {
    if (!(other instanceof DateRange)) {
      return false;
    }
    return (
      this.start.getTime() === other.start.getTime() && this.end.getTime() === other.end.getTime()
    );
  }

  public format(locale = 'en-US'): string {
    const dateFormatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `${dateFormatter.format(this.start)} - ${dateFormatter.format(this.end)}`;
  }

  public toString(): string {
    return this.format();
  }
}

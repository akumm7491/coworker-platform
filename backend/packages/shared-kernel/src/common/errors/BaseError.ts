export enum ErrorCategory {
  Domain = 'Domain',
  Infrastructure = 'Infrastructure',
  Application = 'Application',
}

export enum ErrorSeverity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export class BaseError extends Error {
  public readonly retryable: boolean;

  constructor(
    message: string,
    public readonly category: ErrorCategory = ErrorCategory.Application,
    public readonly severity: ErrorSeverity = ErrorSeverity.Medium,
    retryable = false
  ) {
    super(message);
    this.name = this.constructor.name;
    this.retryable = retryable;

    // Check if Error.captureStackTrace exists before using it
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack;
    }
  }
}

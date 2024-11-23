export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  BUSINESS_RULE = 'BUSINESS_RULE',
  TECHNICAL = 'TECHNICAL',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  SECURITY = 'SECURITY',
  EXTERNAL = 'EXTERNAL',
}

export interface ErrorMetadata {
  code: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  retryable: boolean;
  context?: Record<string, unknown>;
}

export abstract class BaseError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(message: string, metadata: ErrorMetadata) {
    super(message);
    this.name = this.constructor.name;
    this.severity = metadata.severity;
    this.category = metadata.category;
    this.code = metadata.code;
    this.retryable = metadata.retryable;
    this.context = metadata.context;
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      category: this.category,
      retryable: this.retryable,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  public isRetryable(): boolean {
    return this.retryable;
  }

  public getSeverity(): ErrorSeverity {
    return this.severity;
  }

  public getCategory(): ErrorCategory {
    return this.category;
  }
}

import { BaseError, ErrorCategory, ErrorSeverity } from './BaseError';

export class InfrastructureError extends BaseError {
  constructor(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.High,
    retryable = true
  ) {
    super(message, ErrorCategory.Infrastructure, severity, retryable);
  }
}

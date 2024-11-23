import { BaseError, ErrorCategory, ErrorSeverity } from './BaseError';

export class DomainError extends BaseError {
  constructor(message: string, severity: ErrorSeverity = ErrorSeverity.High) {
    super(message, ErrorCategory.Domain, severity);
  }
}

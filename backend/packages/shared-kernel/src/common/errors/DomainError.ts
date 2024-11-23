import { BaseError, ErrorCategory, ErrorSeverity } from './BaseError';

export class DomainError extends BaseError {
  constructor(
    message: string,
    metadata: { code: string; severity?: ErrorSeverity; context?: Record<string, unknown> }
  ) {
    super(message, {
      code: metadata.code,
      severity: metadata.severity ?? ErrorSeverity.MEDIUM,
      category: ErrorCategory.BUSINESS_RULE,
      retryable: false,
      context: metadata.context,
    });
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, {
      code: 'VALIDATION_ERROR',
      severity: ErrorSeverity.LOW,
      context,
    });
  }
}

export class InvariantViolationError extends DomainError {
  constructor(message: string) {
    super(message, { code: 'INVARIANT_VIOLATION', severity: ErrorSeverity.HIGH });
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id ${id} not found`, {
      code: 'ENTITY_NOT_FOUND',
      severity: ErrorSeverity.LOW,
    });
  }
}

export class ConcurrencyError extends DomainError {
  constructor(message: string) {
    super(message, { code: 'CONCURRENCY_ERROR', severity: ErrorSeverity.MEDIUM });
  }
}

export class StateError extends DomainError {
  constructor(message: string) {
    super(message, { code: 'INVALID_STATE', severity: ErrorSeverity.MEDIUM });
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(message: string) {
    super(message, { code: 'BUSINESS_RULE_VIOLATION', severity: ErrorSeverity.HIGH });
  }
}

import { BaseError, ErrorCategory, ErrorSeverity } from './BaseError';

export class InfrastructureError extends BaseError {
  constructor(
    message: string,
    code: string,
    severity = ErrorSeverity.HIGH,
    retryable = true,
    context?: Record<string, unknown>
  ) {
    super(message, {
      code,
      severity,
      category: ErrorCategory.INFRASTRUCTURE,
      retryable,
      context,
    });
  }
}

export class NetworkError extends InfrastructureError {
  constructor(message: string, retryable = true) {
    super(message, 'NETWORK_ERROR', ErrorSeverity.HIGH, retryable);
  }
}

export class DatabaseError extends InfrastructureError {
  constructor(message: string, retryable = true) {
    super(message, 'DATABASE_ERROR', ErrorSeverity.HIGH, retryable);
  }
}

export class ConnectionError extends InfrastructureError {
  constructor(message: string, service: string) {
    super(
      `Connection error with ${service}: ${message}`,
      'CONNECTION_ERROR',
      ErrorSeverity.HIGH,
      true
    );
  }
}

export class TimeoutError extends InfrastructureError {
  constructor(message: string) {
    super(message, 'TIMEOUT_ERROR', ErrorSeverity.MEDIUM, true);
  }
}

export class ExternalServiceError extends InfrastructureError {
  constructor(service: string, message: string, statusCode?: number, retryable = true) {
    super(
      `Error from ${service}: ${message}`,
      'EXTERNAL_SERVICE_ERROR',
      ErrorSeverity.HIGH,
      retryable,
      { service, statusCode }
    );
  }
}

export class MessageBusError extends InfrastructureError {
  constructor(message: string, retryable = true) {
    super(message, 'MESSAGE_BUS_ERROR', ErrorSeverity.HIGH, retryable);
  }
}

export class LockAcquisitionError extends InfrastructureError {
  constructor(resource: string) {
    super(
      `Failed to acquire lock for resource: ${resource}`,
      'LOCK_ACQUISITION_ERROR',
      ErrorSeverity.MEDIUM,
      true
    );
  }
}

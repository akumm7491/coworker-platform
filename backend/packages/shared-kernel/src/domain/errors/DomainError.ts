/**
 * Base class for all domain-specific errors
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when domain validation fails
 */
export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when a domain invariant is violated
 */
export class InvariantViolationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when an entity is not found
 */
export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id ${id} not found`);
  }
}

/**
 * Error thrown when there's a conflict in concurrent operations
 */
export class ConcurrencyError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when an operation is not allowed in the current state
 */
export class StateError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when an operation would violate business rules
 */
export class BusinessRuleViolationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

// Core domain-driven design base classes
export * from './domain/base/Entity';
export * from './domain/base/AggregateRoot';
export * from './domain/base/ValueObject';
export * from './domain/base/Identifier';

// Domain events and event handling
export { IDomainEvent, DomainEvent } from './domain/events/DomainEvent';
export * from './domain/events/EventBus';
export * from './domain/events/CrossContextEvents';

// Domain services and specifications
export * from './domain/services/DomainService';
export * from './domain/specifications/Specification';

// Repositories and data access
export * from './domain/repositories/DomainRepository';

// Common utilities and results
export * from './common/Result';

// Value objects
export * from './domain/value-objects';

// Domain errors
export * from './domain/errors/DomainError';

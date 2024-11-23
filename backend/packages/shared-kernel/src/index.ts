// Domain exports
export * from './domain/base/AggregateRoot';
export * from './domain/base/Entity';
export * from './domain/base/ValueObject';
export * from './domain/events/DomainEvent';
export * from './domain/events/EventBus';
export * from './domain/repositories/DomainRepository';

// Infrastructure exports
export * from './infrastructure/cache/RedisCache';
export * from './infrastructure/persistence/BaseRepository';
export * from './infrastructure/messaging/MessageBus';

// Common exports
export * from './common/Result';
export * from './common/errors/BaseError';
export * from './common/errors/DomainError';
export * from './common/errors/InfrastructureError';

// Example implementations
export * from './examples/domain/UserAggregate';
export * from './examples/infrastructure/UserRepository';
export * from './examples/value-objects/Email';

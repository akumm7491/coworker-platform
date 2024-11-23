# Shared Kernel

This package provides a comprehensive foundation for building domain-driven, event-sourced microservices. It implements common patterns and infrastructure concerns, allowing services to focus on their domain-specific business logic.

## Core Features

### Domain-Driven Design Support
- **Aggregate Roots**: Base classes for implementing aggregate patterns
- **Domain Events**: Event handling and publishing infrastructure
- **Value Objects**: Common value object implementations
- **Domain Services**: Base classes for domain service pattern
- **Repositories**: Layered repository pattern with infrastructure support

### Infrastructure Layer
- **Persistence**: Generic repository pattern with caching and retry support
- **Messaging**: Event bus implementation with outbox pattern
- **Concurrency**: Distributed locking and concurrency control
- **Health Checks**: Health monitoring system
- **Security**: Rate limiting and basic security patterns

### Error Handling & Resilience
- **Error Classification**: Domain vs Infrastructure errors
- **Retry Strategies**: Configurable retry policies
- **Circuit Breaking**: Basic circuit breaker implementation
- **Result Type**: Error handling without exceptions

### Observability
- **Structured Logging**: Context-aware logging system
- **Metrics**: Basic metrics collection
- **Tracing**: Request tracing support
- **Health Monitoring**: Health check system

## Usage Examples

### Repository Pattern

The repository pattern is implemented in three layers:

1. **Infrastructure Layer** (`IRepository` & `BaseRepository`):
```typescript
// Basic CRUD operations with retry and caching
class BaseRepository<T> {
  constructor(options: RepositoryOptions) {
    // Configure caching, retry strategies
  }
  
  protected async withRetry<R>(operation: () => Promise<Result<R>>) {
    // Handles retries with exponential backoff
  }
}
```

2. **Domain Layer** (`IDomainRepository` & `BaseDomainRepository`):
```typescript
// Adds domain-specific operations and event handling
class BaseDomainRepository<T extends AggregateRoot> extends BaseRepository<T> {
  constructor(dataSource: DataSource, eventBus: IEventBus) {
    super();
  }

  async publishEvents(entity: T): Promise<void> {
    // Publishes domain events
  }

  protected async withTransaction<R>(operation: () => Promise<Result<R>>) {
    // Handles transactions
  }
}
```

3. **Service Implementation**:
```typescript
// Concrete implementation in a service
class UserRepository extends BaseDomainRepository<UserAggregate> {
  async findByEmail(email: string): Promise<Result<UserAggregate>> {
    return this.withRetryAndTransaction(async (qr) => {
      // Implement domain-specific query
    });
  }
}
```

### Error Handling

```typescript
// Using the Result type for error handling
async function createUser(data: UserDTO): Promise<Result<User, ValidationError>> {
  const validationResult = await validate(data);
  if (!validationResult.isValid) {
    return Result.fail(new ValidationError(validationResult.errors));
  }
  
  return Result.ok(new User(data));
}
```

### Event Handling

```typescript
// Publishing domain events
class UserAggregate extends AggregateRoot {
  register(email: string): Result<void> {
    // Business logic
    this.addDomainEvent(new UserRegisteredEvent(this.id, email));
    return Result.ok();
  }
}

// Handling events with retry
class UserEventHandler {
  @EventHandler(UserRegisteredEvent)
  async onUserRegistered(event: UserRegisteredEvent): Promise<void> {
    await this.retryStrategy.execute(async () => {
      // Handle the event
    });
  }
}
```

## Best Practices

1. **Error Handling**:
   - Use the Result type for expected failures
   - Throw errors only for programmer errors
   - Always categorize errors properly

2. **Repository Pattern**:
   - Implement specific query methods in domain repositories
   - Use the withRetryAndTransaction helper for operations
   - Always publish domain events after successful operations

3. **Event Handling**:
   - Keep events immutable
   - Include all necessary data in the event
   - Use the outbox pattern for reliability

4. **Testing**:
   - Use the provided test helpers
   - Mock at the repository level
   - Test error cases and retries

## Contributing

When adding new features to the shared kernel:

1. Follow the existing patterns and naming conventions
2. Add proper TypeScript types and documentation
3. Include unit tests for new functionality
4. Update this README with examples if needed

## License

Internal use only - All rights reserved

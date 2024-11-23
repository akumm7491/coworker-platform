# @coworker/shared-kernel

A Domain-Driven Design (DDD) and Event-Driven Architecture shared kernel for the Coworker platform microservices.

## Overview

This package provides the foundational building blocks for implementing DDD and Event-Driven microservices. It includes:

- Base domain entities and value objects
- Event handling infrastructure
- Repository patterns
- Common error handling
- Caching mechanisms
- Type-safe implementations
- Telemetry and observability

## Package Structure

```
src/
├── common/              # Shared utilities and base types
│   ├── Result.ts       # Result type for error handling
│   └── errors/         # Error hierarchy (Domain, Infrastructure)
│
├── domain/             # Domain layer components
│   ├── base/          # Base classes for DDD
│   │   ├── AggregateRoot.ts
│   │   ├── Entity.ts
│   │   └── ValueObject.ts
│   ├── events/        # Domain event handling
│   │   ├── DomainEvent.ts
│   │   └── EventBus.ts
│   └── repositories/  # Repository interfaces
│
├── infrastructure/    # Technical implementations
│   ├── cache/        # Caching infrastructure
│   │   └── RedisCache.ts
│   ├── persistence/  # Database access
│   │   └── BaseRepository.ts
│   └── messaging/    # Message bus implementation
│
├── observability/    # Telemetry and monitoring
│   └── Telemetry.ts
│
└── examples/         # Reference implementations
    ├── domain/      # Example domain model
    │   └── UserAggregate.ts
    ├── infrastructure/
    │   └── UserRepository.ts
    └── value-objects/
        └── Email.ts
```

## Docker Support

The shared-kernel package includes a base Dockerfile that other services can extend. This ensures consistency across services and reduces configuration duplication.

### Base Dockerfile Features

- Multi-stage builds for optimal image size
- Production-optimized configuration
- Security best practices
- Shared dependencies and types
- Volume support for code sharing

### Building the Base Image

```bash
# Build the shared-kernel base image
docker build -t shared-kernel .
```

### Using in Other Services

1. Create a Dockerfile in your service directory:

```dockerfile
# Example service Dockerfile
FROM shared-kernel AS shared

FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Copy shared dependencies and types
COPY --from=shared /app/node_modules/@coworker/shared-kernel ./node_modules/@coworker/shared-kernel
COPY --from=shared /app/dist ./node_modules/@coworker/shared-kernel/dist

# Add your service-specific configuration
...
```

2. Build your service:

```bash
docker build -t your-service .
```

### Docker Compose Integration

Example docker-compose.yml for local development:

```yaml
version: '3.8'

services:
  shared-kernel:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - ./dist:/app/dist
      - ./node_modules:/app/node_modules

  your-service:
    build:
      context: ../your-service
      dockerfile: Dockerfile
    depends_on:
      - shared-kernel
    environment:
      - NODE_ENV=development
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Build the package:
```bash
npm run build
```

3. Run tests:
```bash
npm test
```

## Usage

Example usage of the User aggregate and repository:

```typescript
import { UserAggregate } from '@domain/UserAggregate';
import { UserRepository } from '@infrastructure/UserRepository';
import { Result } from '@common/Result';

// Create a new user
const userOrError = UserAggregate.create({
  email: 'user@example.com',
  name: 'John Doe'
});

if (userOrError.isOk()) {
  const user = userOrError.getValue();
  const result = await userRepository.save(user);
  
  if (result.isOk()) {
    // User saved successfully
    const savedUser = result.getValue();
  }
}
```

## Configuration

The package requires the following environment variables:

- `REDIS_HOST`: Redis server host
- `REDIS_PORT`: Redis server port
- `REDIS_PASSWORD`: Redis server password (optional)
- `REDIS_DB`: Redis database number

## Development

1. Run linting:
```bash
npm run lint
```

2. Format code:
```bash
npm run format
```

3. Run tests with coverage:
```bash
npm run test:cov
```

## Best Practices

1. **Domain-Driven Design**
   - Keep domain logic in aggregates
   - Use value objects for domain concepts
   - Implement domain events for state changes

2. **Error Handling**
   - Use Result type for operations
   - Implement proper error context
   - Handle infrastructure errors appropriately

3. **Testing**
   - Write unit tests for domain logic
   - Integration tests for repositories
   - Mock external dependencies

4. **Docker Best Practices**
   - Use multi-stage builds
   - Minimize image size
   - Follow security best practices
   - Share common dependencies

## Contributing

1. Follow the established patterns in the examples
2. Ensure proper error handling
3. Add tests for new functionality
4. Update documentation as needed

## License

MIT

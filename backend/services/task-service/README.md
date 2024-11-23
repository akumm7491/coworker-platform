# Task Service

Task management service for the Coworker platform.

## Description

This service handles task-related operations including:
- Task creation and management
- Task assignment and status updates
- Task prioritization and scheduling

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the service:
   ```bash
   npm run build
   ```

3. Run the service:
   ```bash
   npm start
   ```

## Development

Run in development mode with hot reload:
```bash
npm run dev
```

## Testing

Run tests:
```bash
npm test
```

## Architecture

This service follows Domain-Driven Design principles and is organized into the following layers:

- Domain: Core business logic and entities
- Application: Use cases and orchestration
- Infrastructure: Technical implementations
- Interfaces: API endpoints and external communication

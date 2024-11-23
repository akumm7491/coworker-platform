#!/bin/bash

# Create new directory structure
mkdir -p backend/packages/shared-kernel/src/domain/{entities,repositories,events,types}
mkdir -p backend/packages/infrastructure/src/{database,messaging,external}
mkdir -p backend/packages/contracts/src/{dtos,events}

# Move existing entities to shared-kernel
mv backend/packages/shared/src/database/entities/* backend/packages/shared-kernel/src/domain/entities/

# Move existing types
mv backend/packages/shared/src/types/* backend/packages/shared-kernel/src/domain/types/

# Move repository interfaces to domain layer
mv backend/packages/shared/src/database/repositories/interfaces/* backend/packages/shared-kernel/src/domain/repositories/

# Move repository implementations to infrastructure
mv backend/packages/shared/src/database/repositories/*.ts backend/packages/infrastructure/src/database/

# Move event definitions
mv backend/packages/shared/src/events/* backend/packages/contracts/src/events/

# Create symlinks for backward compatibility (optional)
ln -s ../../../packages/shared-kernel/src/domain/entities backend/packages/shared/src/database/entities
ln -s ../../../packages/shared-kernel/src/domain/repositories backend/packages/shared/src/database/repositories/interfaces
ln -s ../../../packages/shared-kernel/src/domain/types backend/packages/shared/src/types

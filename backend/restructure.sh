#!/bin/bash

# Base directories
SHARED_KERNEL_DIR="packages/shared-kernel/src/domain"
TASK_SERVICE_DIR="packages/task-service/src/domain"
TEAM_SERVICE_DIR="packages/team-service/src/domain"
AGENT_SERVICE_DIR="packages/agent-service/src/domain"

# Create directories if they don't exist
mkdir -p "$TASK_SERVICE_DIR"/{entities,events,repositories,types}
mkdir -p "$TEAM_SERVICE_DIR"/{entities,events,repositories,types}
mkdir -p "$AGENT_SERVICE_DIR"/{entities,events,repositories,types}

# Move Task-related files
cp -r "$SHARED_KERNEL_DIR/entities/Task.ts" "$TASK_SERVICE_DIR/entities/"
cp -r "$SHARED_KERNEL_DIR/events/task" "$TASK_SERVICE_DIR/events/"
cp -r "$SHARED_KERNEL_DIR/repositories/ITaskRepository.ts" "$TASK_SERVICE_DIR/repositories/"
cp -r "$SHARED_KERNEL_DIR/types/task.types.ts" "$TASK_SERVICE_DIR/types/"

# Move Team-related files
cp -r "$SHARED_KERNEL_DIR/entities/Team.ts" "$TEAM_SERVICE_DIR/entities/"
cp -r "$SHARED_KERNEL_DIR/events/team" "$TEAM_SERVICE_DIR/events/"
cp -r "$SHARED_KERNEL_DIR/repositories/ITeamRepository.ts" "$TEAM_SERVICE_DIR/repositories/"
cp -r "$SHARED_KERNEL_DIR/types/team.types.ts" "$TEAM_SERVICE_DIR/types/"

# Move Agent-related files
cp -r "$SHARED_KERNEL_DIR/entities/Agent.ts" "$AGENT_SERVICE_DIR/entities/"
cp -r "$SHARED_KERNEL_DIR/events/agent" "$AGENT_SERVICE_DIR/events/"
cp -r "$SHARED_KERNEL_DIR/repositories/IAgentRepository.ts" "$AGENT_SERVICE_DIR/repositories/"
cp -r "$SHARED_KERNEL_DIR/types/agent.types.ts" "$AGENT_SERVICE_DIR/types/"

# Create index.ts files for each service
echo "export * from './entities/Task';
export * from './events/task/TaskEvents';
export * from './repositories/ITaskRepository';
export * from './types/task.types';" > "$TASK_SERVICE_DIR/index.ts"

echo "export * from './entities/Team';
export * from './events/team/TeamEvents';
export * from './repositories/ITeamRepository';
export * from './types/team.types';" > "$TEAM_SERVICE_DIR/index.ts"

echo "export * from './entities/Agent';
export * from './events/agent/AgentEvents';
export * from './repositories/IAgentRepository';
export * from './types/agent.types';" > "$AGENT_SERVICE_DIR/index.ts"

# Remove the files from shared-kernel (we'll do this manually after verifying the copies worked)

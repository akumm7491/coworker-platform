import { ProjectStatus } from '@coworker/shared/types/agent';
import { Project } from '../aggregates/project.aggregate';
import { Task } from '../entities/task.entity';

export class ProjectCreatedEvent {
  constructor(public readonly project: Project) {}
}

export class ProjectStatusUpdatedEvent {
  constructor(
    public readonly projectId: string,
    public readonly newStatus: ProjectStatus
  ) {}
}

export class TaskAddedEvent {
  constructor(
    public readonly projectId: string,
    public readonly task: Task
  ) {}
}

export class TeamAssignedEvent {
  constructor(
    public readonly projectId: string,
    public readonly teamId: string
  ) {}
}

// Event for when project analytics are updated
export class ProjectAnalyticsUpdatedEvent {
  constructor(
    public readonly projectId: string,
    public readonly analytics: Record<string, unknown>
  ) {}
}

// Event for external integrations
export class ProjectIntegrationEvent {
  constructor(
    public readonly projectId: string,
    public readonly integrationType: string,
    public readonly data: Record<string, unknown>
  ) {}
}

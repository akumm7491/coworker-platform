import { BaseEvent } from './BaseEvent';
import { ProjectStatus, ProjectVision } from '@coworker/shared-kernel/domain/types/project.types';

export class ProjectCreatedIntegrationEvent extends BaseEvent {
  constructor(
    aggregateId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly vision: ProjectVision
  ) {
    super('ProjectCreated', aggregateId);
  }
}

export class ProjectStatusChangedIntegrationEvent extends BaseEvent {
  constructor(
    aggregateId: string,
    public readonly oldStatus: ProjectStatus,
    public readonly newStatus: ProjectStatus
  ) {
    super('ProjectStatusChanged', aggregateId);
  }
}

export class ProjectTeamAssignedIntegrationEvent extends BaseEvent {
  constructor(
    aggregateId: string,
    public readonly teamId: string,
    public readonly projectName: string
  ) {
    super('ProjectTeamAssigned', aggregateId);
  }
}

export class ProjectTaskCompletedIntegrationEvent extends BaseEvent {
  constructor(
    aggregateId: string,
    public readonly taskId: string,
    public readonly completedBy: string
  ) {
    super('ProjectTaskCompleted', aggregateId);
  }
}

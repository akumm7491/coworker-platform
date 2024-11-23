import { DomainEvent } from '../DomainEvent';
import { TaskStatus, TaskPriority, TaskType } from '../../types/task.types';

export class TaskCreatedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly projectId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly status: TaskStatus,
    public readonly priority: TaskPriority,
    public readonly type: TaskType,
  ) {
    super();
  }
}

export class TaskAssignedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly agentId: string,
    public readonly assignedAt: Date,
  ) {
    super();
  }
}

export class TaskUnassignedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly previousAgentId: string,
    public readonly unassignedAt: Date,
  ) {
    super();
  }
}

export class TaskStatusChangedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly previousStatus: TaskStatus,
    public readonly newStatus: TaskStatus,
    public readonly changedAt: Date,
  ) {
    super();
  }
}

export class TaskPriorityChangedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly previousPriority: TaskPriority,
    public readonly newPriority: TaskPriority,
    public readonly changedAt: Date,
  ) {
    super();
  }
}

export class TaskProgressUpdatedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly previousProgress: number,
    public readonly newProgress: number,
    public readonly updatedAt: Date,
  ) {
    super();
  }
}

export class TaskDependencyAddedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly dependencyId: string,
    public readonly addedAt: Date,
  ) {
    super();
  }
}

export class TaskDependencyRemovedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly dependencyId: string,
    public readonly removedAt: Date,
  ) {
    super();
  }
}

export class TaskCompletedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly completedBy: string,
    public readonly completedAt: Date,
    public readonly metrics: {
      completion_time: number;
      code_quality: number;
      test_coverage: number;
      performance_score: number;
    },
  ) {
    super();
  }
}

export class TaskDeletedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly deletedAt: Date,
    public readonly reason?: string,
  ) {
    super();
  }
}

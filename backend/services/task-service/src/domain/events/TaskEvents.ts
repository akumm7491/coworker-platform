import { DomainEvent } from '@coworker/shared-kernel';
import { TaskStatus, TaskPriority } from '../models/TaskStatus';

export class TaskCreatedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly title: string,
    public readonly createdById: string,
    public readonly assigneeId?: string
  ) {
    super('TaskCreated', taskId);
  }
}

export class TaskAssignedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly assigneeId: string,
    public readonly previousAssigneeId?: string
  ) {
    super('TaskAssigned', taskId);
  }
}

export class TaskStatusChangedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly newStatus: TaskStatus,
    public readonly previousStatus: TaskStatus
  ) {
    super('TaskStatusChanged', taskId);
  }
}

export class TaskPriorityChangedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly newPriority: TaskPriority,
    public readonly previousPriority: TaskPriority
  ) {
    super('TaskPriorityChanged', taskId);
  }
}

export class TaskDueDateChangedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly newDueDate?: Date,
    public readonly previousDueDate?: Date
  ) {
    super('TaskDueDateChanged', taskId);
  }
}

export class TaskCompletedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly completedAt: Date,
    public readonly completedById: string
  ) {
    super('TaskCompleted', taskId);
  }
}

export class TaskUpdatedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly updates: {
      title?: string;
      description?: string;
      assigneeId?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: Date;
      labels?: string[];
    }
  ) {
    super('TaskUpdated', taskId);
  }
}

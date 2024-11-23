import { DomainEvent } from '@coworker/shared-kernel';
import { TaskStatus, TaskPriority } from '../types/task.types';

export class TaskCreatedEvent implements DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly priority: TaskPriority,
    public readonly assignedTeamId?: string
  ) {}

  readonly eventType = 'TaskCreatedEvent';
  readonly dateTimeOccurred = new Date();
  readonly version = 1;

  toJSON() {
    return {
      eventType: this.eventType,
      taskId: this.taskId,
      title: this.title,
      description: this.description,
      priority: this.priority,
      assignedTeamId: this.assignedTeamId,
      dateTimeOccurred: this.dateTimeOccurred,
      version: this.version,
    };
  }
}

export class TaskStatusUpdatedEvent implements DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly oldStatus: TaskStatus,
    public readonly newStatus: TaskStatus
  ) {}

  readonly eventType = 'TaskStatusUpdatedEvent';
  readonly dateTimeOccurred = new Date();
  readonly version = 1;

  toJSON() {
    return {
      eventType: this.eventType,
      taskId: this.taskId,
      oldStatus: this.oldStatus,
      newStatus: this.newStatus,
      dateTimeOccurred: this.dateTimeOccurred,
      version: this.version,
    };
  }
}

export class TaskAssignedEvent implements DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly teamId: string,
    public readonly agentId?: string
  ) {}

  readonly eventType = 'TaskAssignedEvent';
  readonly dateTimeOccurred = new Date();
  readonly version = 1;

  toJSON() {
    return {
      eventType: this.eventType,
      taskId: this.taskId,
      teamId: this.teamId,
      agentId: this.agentId,
      dateTimeOccurred: this.dateTimeOccurred,
      version: this.version,
    };
  }
}

export class TaskDeletedEvent implements DomainEvent {
  constructor(public readonly taskId: string) {}

  readonly eventType = 'TaskDeletedEvent';
  readonly dateTimeOccurred = new Date();
  readonly version = 1;

  toJSON() {
    return {
      eventType: this.eventType,
      taskId: this.taskId,
      dateTimeOccurred: this.dateTimeOccurred,
      version: this.version,
    };
  }
}

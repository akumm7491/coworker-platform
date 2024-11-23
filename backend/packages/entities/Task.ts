import { AggregateRoot } from '../shared-kernel/src/domain/base/AggregateRoot';
import { Result } from '../Result';
import { Agent } from './Agent';
import { TaskStatus, TaskPriority, TaskType } from '../types/task.types';
import {
  TaskCreatedEvent,
  TaskStatusUpdatedEvent,
  TaskPriorityUpdatedEvent,
  TaskAssignedEvent,
  TaskProgressUpdatedEvent,
  TaskCompletedEvent,
} from '../events/task.events';

export class Task extends AggregateRoot {
  private _name: string;
  private _description: string;
  private _status: TaskStatus;
  private _priority: TaskPriority;
  private _type: TaskType;
  private _progress: number;
  private _assignee?: Agent;
  private _startDate?: Date;
  private _completionDate?: Date;
  private _deadline?: Date;

  private constructor(id: string, name: string, description: string, type: TaskType) {
    super(id);
    this._name = name;
    this._description = description;
    this._type = type;
    this._status = TaskStatus.PENDING;
    this._priority = TaskPriority.MEDIUM;
    this._progress = 0;
  }

  public static create(
    id: string,
    name: string,
    description: string,
    type: TaskType
  ): Result<Task> {
    if (!name || name.trim().length === 0) {
      return Result.fail('Task name is required');
    }
    if (!description || description.trim().length === 0) {
      return Result.fail('Task description is required');
    }

    const task = new Task(id, name, description, type);
    task.addDomainEvent(new TaskCreatedEvent(id, name, description, type));
    return Result.ok(task);
  }

  // Status Management
  public updateStatus(newStatus: TaskStatus): Result<void> {
    const oldStatus = this._status;
    this._status = newStatus;

    if (newStatus === TaskStatus.COMPLETED) {
      this._completionDate = new Date();
      this._progress = 100;
      this.addDomainEvent(new TaskCompletedEvent(this.id));
    }

    this.addDomainEvent(new TaskStatusUpdatedEvent(this.id, oldStatus, newStatus));
    return Result.ok();
  }

  // Priority Management
  public updatePriority(priority: TaskPriority): Result<void> {
    const oldPriority = this._priority;
    this._priority = priority;
    this.addDomainEvent(new TaskPriorityUpdatedEvent(this.id, oldPriority, priority));
    return Result.ok();
  }

  // Assignment Management
  public assign(agent: Agent): Result<void> {
    this._assignee = agent;
    this.addDomainEvent(new TaskAssignedEvent(this.id, agent.id));
    return Result.ok();
  }

  public unassign(): Result<void> {
    this._assignee = undefined;
    return Result.ok();
  }

  // Progress Management
  public updateProgress(progress: number): Result<void> {
    if (progress < 0 || progress > 100) {
      return Result.fail('Progress must be between 0 and 100');
    }

    this._progress = progress;
    this.addDomainEvent(new TaskProgressUpdatedEvent(this.id, progress));

    if (progress === 100) {
      this.updateStatus(TaskStatus.COMPLETED);
    }

    return Result.ok();
  }

  // Timeline Management
  public updateStartDate(date: Date): Result<void> {
    this._startDate = date;
    return Result.ok();
  }

  public updateDeadline(date: Date): Result<void> {
    this._deadline = date;
    return Result.ok();
  }

  // Getters
  public get name(): string {
    return this._name;
  }
  public get description(): string {
    return this._description;
  }
  public get status(): TaskStatus {
    return this._status;
  }
  public get priority(): TaskPriority {
    return this._priority;
  }
  public get type(): TaskType {
    return this._type;
  }
  public get progress(): number {
    return this._progress;
  }
  public get assignee(): Agent | undefined {
    return this._assignee;
  }
  public get startDate(): Date | undefined {
    return this._startDate;
  }
  public get completionDate(): Date | undefined {
    return this._completionDate;
  }
  public get deadline(): Date | undefined {
    return this._deadline;
  }
}

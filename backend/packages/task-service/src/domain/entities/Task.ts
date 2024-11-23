import { AggregateRoot } from '@coworker/shared-kernel';
import { Result } from '@coworker/shared-kernel';
import { TaskStatus, TaskPriority } from '../types/task.types';
import { TaskId } from '../value-objects/TaskId';
import { TaskTitle } from '../value-objects/TaskTitle';
import {
  TaskCreatedEvent,
  TaskStatusUpdatedEvent,
  TaskAssignedEvent,
  TaskDeletedEvent,
} from '../events/TaskEvents';

interface TaskProps {
  id: TaskId;
  title: TaskTitle;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  assignedTeamId?: string;
  assignedAgentId?: string;
  startDate?: Date;
  completionDate?: Date;
  deadline?: Date;
}

export class Task extends AggregateRoot<TaskProps> {
  private constructor(props: TaskProps) {
    super(props);
  }

  // Getters
  get taskId(): TaskId {
    return this.props.id;
  }

  get title(): TaskTitle {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  get priority(): TaskPriority {
    return this.props.priority;
  }

  get progress(): number {
    return this.props.progress;
  }

  // Factory method
  public static create(
    id: string,
    title: string,
    description: string,
    priority: TaskPriority = TaskPriority.MEDIUM,
    assignedTeamId?: string
  ): Result<Task> {
    const taskIdOrError = TaskId.create(id);
    if (taskIdOrError.isFailure) {
      return Result.fail(taskIdOrError.getError());
    }

    const titleOrError = TaskTitle.create(title);
    if (titleOrError.isFailure) {
      return Result.fail(titleOrError.getError());
    }

    if (!description || description.trim().length === 0) {
      return Result.fail('Task description cannot be empty');
    }

    const task = new Task({
      id: taskIdOrError.getValue(),
      title: titleOrError.getValue(),
      description: description.trim(),
      status: TaskStatus.TODO,
      priority,
      progress: 0,
      assignedTeamId,
    });

    task.addDomainEvent(
      new TaskCreatedEvent(
        task.taskId.value,
        task.title.value,
        task.description,
        task.priority,
        task.props.assignedTeamId
      )
    );

    return Result.ok(task);
  }

  // Business logic methods
  public updateStatus(newStatus: TaskStatus): Result<void> {
    if (this.props.status === newStatus) {
      return Result.ok();
    }

    const oldStatus = this.props.status;
    this.props.status = newStatus;

    if (newStatus === TaskStatus.IN_PROGRESS && !this.props.startDate) {
      this.props.startDate = new Date();
    }

    if (newStatus === TaskStatus.DONE && !this.props.completionDate) {
      this.props.completionDate = new Date();
      this.props.progress = 100;
    }

    this.addDomainEvent(
      new TaskStatusUpdatedEvent(this.taskId.value, oldStatus, newStatus)
    );

    return Result.ok();
  }

  public assign(teamId: string, agentId?: string): Result<void> {
    if (!teamId || teamId.trim().length === 0) {
      return Result.fail('Team ID cannot be empty');
    }

    this.props.assignedTeamId = teamId;
    this.props.assignedAgentId = agentId;

    this.addDomainEvent(
      new TaskAssignedEvent(this.taskId.value, teamId, agentId)
    );

    return Result.ok();
  }

  public updateProgress(progress: number): Result<void> {
    if (progress < 0 || progress > 100) {
      return Result.fail('Progress must be between 0 and 100');
    }

    this.props.progress = progress;

    if (progress === 100 && this.props.status !== TaskStatus.DONE) {
      return this.updateStatus(TaskStatus.DONE);
    }

    return Result.ok();
  }

  public markAsDeleted(): Result<void> {
    this.addDomainEvent(new TaskDeletedEvent(this.taskId.value));
    return Result.ok();
  }
}

import { IsNotEmpty, IsUUID, IsOptional, IsEnum, IsDate, MinLength } from 'class-validator';
import { TaskStatus, TaskPriority } from '../../domain/models/TaskStatus';

export class UpdateTaskCommand {
  @IsNotEmpty()
  @IsUUID()
  readonly taskId: string;

  @IsOptional()
  @MinLength(3)
  readonly title?: string;

  @IsOptional()
  readonly description?: string;

  @IsOptional()
  @IsUUID()
  readonly assigneeId?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  readonly status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  readonly priority?: TaskPriority;

  @IsOptional()
  @IsDate()
  readonly dueDate?: Date;

  @IsOptional()
  readonly labels?: string[];

  constructor(
    taskId: string,
    updates: {
      title?: string;
      description?: string;
      assigneeId?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: Date;
      labels?: string[];
    }
  ) {
    this.taskId = taskId;
    Object.assign(this, updates);
  }
}

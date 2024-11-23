import { IsNotEmpty, IsUUID, IsOptional, IsEnum, IsDate, MinLength } from 'class-validator';
import { TaskPriority } from '../../domain/models/TaskStatus';

export class CreateTaskCommand {
  @IsNotEmpty()
  @MinLength(3)
  readonly title: string;

  @IsOptional()
  readonly description?: string;

  @IsUUID()
  readonly createdById: string;

  @IsOptional()
  @IsUUID()
  readonly assigneeId?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  readonly priority?: TaskPriority;

  @IsOptional()
  @IsDate()
  readonly dueDate?: Date;

  @IsOptional()
  readonly labels?: string[];

  constructor(
    title: string,
    createdById: string,
    description?: string,
    assigneeId?: string,
    priority: TaskPriority = TaskPriority.MEDIUM,
    dueDate?: Date,
    labels?: string[]
  ) {
    this.title = title;
    this.createdById = createdById;
    this.description = description;
    this.assigneeId = assigneeId;
    this.priority = priority;
    this.dueDate = dueDate;
    this.labels = labels;
  }
}

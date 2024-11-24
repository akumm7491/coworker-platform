import { IsNotEmpty, IsUUID, IsOptional, IsEnum, IsDate, MinLength } from 'class-validator';
import { TaskPriority } from '../../domain/models/TaskStatus';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskCommand {
  @ApiProperty({ description: 'Title of the task', minLength: 3 })
  @IsNotEmpty()
  @MinLength(3)
  readonly title: string;

  @ApiPropertyOptional({ description: 'Detailed description of the task' })
  @IsOptional()
  readonly description?: string;

  @ApiProperty({ description: 'UUID of the user creating the task' })
  @IsUUID()
  readonly createdById: string;

  @ApiPropertyOptional({ description: 'UUID of the user assigned to the task' })
  @IsOptional()
  @IsUUID()
  readonly assigneeId?: string;

  @ApiPropertyOptional({
    description: 'Priority level of the task',
    enum: TaskPriority,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  readonly priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Due date for the task',
    type: Date,
  })
  @IsOptional()
  @IsDate()
  readonly dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Labels/tags associated with the task',
    type: [String],
  })
  @IsOptional()
  readonly labels?: string[];

  constructor(
    title: string,
    createdById: string,
    description?: string,
    assigneeId?: string,
    priority?: TaskPriority,
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

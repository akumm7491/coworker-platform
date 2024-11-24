import { IsNotEmpty, IsUUID, IsOptional, IsEnum, IsDate, MinLength } from 'class-validator';
import { TaskStatus, TaskPriority } from '../../domain/models/TaskStatus';
import { ICommand } from '@nestjs/cqrs';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface UpdateTaskCommandProps {
  taskId: string;
  title?: string;
  description?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  labels?: string[];
}

export class UpdateTaskCommand implements ICommand {
  @ApiProperty({
    description: 'UUID of the task to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  readonly taskId: string;

  @ApiPropertyOptional({
    description: 'New title for the task',
    minLength: 3,
    example: 'Updated Task Title',
  })
  @IsOptional()
  @MinLength(3)
  readonly title?: string;

  @ApiPropertyOptional({
    description: 'New description for the task',
    example: 'This is an updated description for the task',
  })
  @IsOptional()
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'UUID of the new assignee',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  readonly assigneeId?: string;

  @ApiPropertyOptional({
    description: 'New status for the task',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  readonly status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'New priority level for the task',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  readonly priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'New due date for the task',
    type: Date,
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDate()
  readonly dueDate?: Date;

  @ApiPropertyOptional({
    description: 'New labels/tags for the task',
    type: [String],
    example: ['important', 'backend', 'feature'],
  })
  @IsOptional()
  readonly labels?: string[];

  constructor(props: UpdateTaskCommandProps) {
    this.taskId = props.taskId;
    this.title = props.title;
    this.description = props.description;
    this.assigneeId = props.assigneeId;
    this.status = props.status;
    this.priority = props.priority;
    this.dueDate = props.dueDate;
    this.labels = props.labels;
  }

  public static getCommandName(): string {
    return UpdateTaskCommand.name;
  }
}

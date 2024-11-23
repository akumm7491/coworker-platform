import { IsOptional, IsUUID, IsEnum, IsInt, Min, Max } from 'class-validator';
import { TaskStatus, TaskPriority } from '../../domain/models/TaskStatus';

export class ListTasksQuery {
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
  readonly labels?: string[];

  @IsInt()
  @Min(1)
  readonly page: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  readonly pageSize: number = 20;

  constructor(
    filters: {
      assigneeId?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      labels?: string[];
      page?: number;
      pageSize?: number;
    } = {}
  ) {
    Object.assign(this, filters);
  }
}

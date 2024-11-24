import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTaskCommand } from '../../application/commands/CreateTaskCommand';
import { UpdateTaskCommand } from '../../application/commands/UpdateTaskCommand';
import { DeleteTaskCommand } from '../../application/commands/DeleteTaskCommand';
import { GetTaskQuery } from '../../application/queries/GetTaskQuery';
import { ListTasksQuery } from '../../application/queries/ListTasksQuery';
import { Task } from '../../domain/models/Task';
import { TaskStatus, TaskPriority } from '../../domain/models/TaskStatus';

interface UpdateTaskDto {
  title?: string;
  description?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  labels?: string[];
}

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  async createTask(@Body(ValidationPipe) command: CreateTaskCommand): Promise<Task> {
    return this.commandBus.execute(command);
  }

  @Put(':taskId')
  async updateTask(
    @Param('taskId') taskId: string,
    @Body(ValidationPipe) updates: UpdateTaskDto
  ): Promise<Task> {
    const command = new UpdateTaskCommand(taskId, updates);
    console.log('Update command:', JSON.stringify(command));
    return this.commandBus.execute(command);
  }

  @Get(':taskId')
  async getTask(@Param('taskId') taskId: string): Promise<Task> {
    return this.queryBus.execute(new GetTaskQuery(taskId));
  }

  @Get()
  async listTasks(
    @Query('status') status?: TaskStatus,
    @Query('assigneeId') assigneeId?: string,
    @Query('priority') priority?: TaskPriority,
    @Query('labels') labels?: string[],
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20
  ): Promise<{ tasks: Task[]; total: number }> {
    const query = new ListTasksQuery({
      status,
      assigneeId,
      priority,
      labels,
      page,
      pageSize,
    });
    return this.queryBus.execute(query);
  }

  @Delete(':taskId')
  async deleteTask(
    @Param('taskId') taskId: string,
    @Body('deletedById') deletedById = '123e4567-e89b-12d3-a456-426614174000'
  ): Promise<void> {
    const command = new DeleteTaskCommand(taskId, deletedById);
    await this.commandBus.execute(command);
  }
}

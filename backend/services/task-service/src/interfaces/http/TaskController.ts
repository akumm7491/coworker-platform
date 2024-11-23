import { Controller, Get, Post, Put, Body, Param, Query, ValidationPipe } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTaskCommand } from '../../application/commands/CreateTaskCommand';
import { UpdateTaskCommand } from '../../application/commands/UpdateTaskCommand';
import { GetTaskQuery } from '../../application/queries/GetTaskQuery';
import { ListTasksQuery } from '../../application/queries/ListTasksQuery';
import { Task } from '../../domain/models/Task';
import { TaskStatus, TaskPriority } from '../../domain/models/TaskStatus';

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
    @Body(ValidationPipe) updates: Omit<UpdateTaskCommand, 'taskId'>
  ): Promise<Task> {
    const command = { taskId, ...updates } as UpdateTaskCommand;
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
}

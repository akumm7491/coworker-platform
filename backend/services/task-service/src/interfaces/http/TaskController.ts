import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Task } from '../../domain/models/Task';
import { CreateTaskCommand } from '../../application/commands/CreateTaskCommand';
import { UpdateTaskCommand } from '../../application/commands/UpdateTaskCommand';
import { DeleteTaskCommand } from '../../application/commands/DeleteTaskCommand';
import { GetTaskQuery } from '../../application/queries/GetTaskQuery';
import { ListTasksQuery } from '../../application/queries/ListTasksQuery';
import { ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller('tasks')
@ApiTags('tasks')
export class TaskController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskCommand })
  @ApiResponse({ status: 201, description: 'Task created successfully', type: Task })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createTask(@Body(ValidationPipe) command: CreateTaskCommand): Promise<Task> {
    return this.commandBus.execute(command);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiQuery({ name: 'assigneeId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiResponse({ status: 200, description: 'List of tasks retrieved successfully', type: [Task] })
  async getTasks(@Query() query: ListTasksQuery): Promise<{ tasks: Task[]; total: number }> {
    return this.queryBus.execute(new ListTasksQuery(query));
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Get a specific task' })
  @ApiParam({ name: 'taskId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully', type: Task })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getTask(@Param('taskId') taskId: string): Promise<Task> {
    return this.queryBus.execute(new GetTaskQuery(taskId));
  }

  @Put(':taskId')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'taskId', type: 'string' })
  @ApiBody({ type: UpdateTaskCommand })
  @ApiResponse({ status: 200, description: 'Task updated successfully', type: Task })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async updateTask(
    @Param('taskId') taskId: string,
    @Body(ValidationPipe) updates: UpdateTaskCommand
  ): Promise<Task> {
    return this.commandBus.execute(new UpdateTaskCommand(taskId, updates));
  }

  @Delete(':taskId')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'taskId', type: 'string' })
  @ApiParam({ name: 'deletedById', type: 'string' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async deleteTask(
    @Param('taskId') taskId: string,
    @Body('deletedById') deletedById: string
  ): Promise<void> {
    await this.commandBus.execute(new DeleteTaskCommand(taskId, deletedById));
  }
}

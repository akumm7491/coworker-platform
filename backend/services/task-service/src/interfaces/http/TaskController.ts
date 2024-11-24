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
import { TaskStatus, TaskPriority } from '../../domain/models/TaskStatus';

@Controller('tasks')
@ApiTags('Tasks')
export class TaskController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new task',
    description: 'Creates a new task with the provided details',
    operationId: 'createTask',
  })
  @ApiBody({
    type: CreateTaskCommand,
    description: 'Task creation payload',
    examples: {
      example1: {
        summary: 'Create a high priority task',
        description: 'Example of creating a new high priority task with labels',
        value: {
          title: 'Implement API Documentation',
          description: 'Add Swagger documentation to all endpoints',
          createdById: '123e4567-e89b-12d3-a456-426614174000',
          assigneeId: '123e4567-e89b-12d3-a456-426614174001',
          priority: TaskPriority.HIGH,
          dueDate: '2024-12-31T23:59:59Z',
          labels: ['documentation', 'api'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: Task,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input - Please check the request payload',
  })
  async createTask(@Body(ValidationPipe) command: CreateTaskCommand): Promise<Task> {
    return this.commandBus.execute(command);
  }

  @Get()
  @ApiOperation({
    summary: 'List all tasks',
    description: 'Retrieves a list of tasks with optional filtering',
    operationId: 'listTasks',
  })
  @ApiQuery({
    name: 'assigneeId',
    required: false,
    description: 'Filter tasks by assignee ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TaskStatus,
    description: 'Filter tasks by status',
    example: TaskStatus.IN_PROGRESS,
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: TaskPriority,
    description: 'Filter tasks by priority',
    example: TaskPriority.HIGH,
  })
  @ApiResponse({
    status: 200,
    description: 'List of tasks retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        tasks: {
          type: 'array',
          items: { $ref: '#/components/schemas/Task' },
        },
        total: {
          type: 'number',
          description: 'Total number of tasks matching the filter criteria',
        },
      },
    },
  })
  async getTasks(@Query() query: ListTasksQuery): Promise<{ tasks: Task[]; total: number }> {
    return this.queryBus.execute(new ListTasksQuery(query));
  }

  @Get(':taskId')
  @ApiOperation({
    summary: 'Get task by ID',
    description: 'Retrieves a specific task by its ID',
    operationId: 'getTaskById',
  })
  @ApiParam({
    name: 'taskId',
    type: 'string',
    description: 'UUID of the task to retrieve',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
    type: Task,
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async getTask(@Param('taskId') taskId: string): Promise<Task> {
    return this.queryBus.execute(new GetTaskQuery(taskId));
  }

  @Put(':taskId')
  @ApiOperation({
    summary: 'Update task',
    description: 'Updates an existing task with the provided changes',
    operationId: 'updateTask',
  })
  @ApiParam({
    name: 'taskId',
    type: 'string',
    description: 'UUID of the task to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateTaskCommand,
    description: 'Task update payload',
    examples: {
      example1: {
        summary: 'Update task status and priority',
        description: "Example of updating a task's status and priority",
        value: {
          title: 'Updated Task Title',
          description: 'Updated task description',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          assigneeId: '123e4567-e89b-12d3-a456-426614174001',
          dueDate: '2024-12-31T23:59:59Z',
          labels: ['updated', 'important'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: Task,
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input - Please check the request payload',
  })
  async updateTask(
    @Param('taskId') taskId: string,
    @Body(ValidationPipe) updates: Partial<UpdateTaskCommand>
  ): Promise<Task> {
    return this.commandBus.execute(new UpdateTaskCommand(taskId, updates));
  }

  @Delete(':taskId')
  @ApiOperation({
    summary: 'Delete task',
    description: 'Permanently deletes a task',
    operationId: 'deleteTask',
  })
  @ApiParam({
    name: 'taskId',
    type: 'string',
    description: 'UUID of the task to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['deletedById'],
      properties: {
        deletedById: {
          type: 'string',
          description: 'UUID of the user deleting the task',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
    examples: {
      example1: {
        summary: 'Delete task payload',
        description: 'Example of the delete task request body',
        value: {
          deletedById: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Task deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async deleteTask(
    @Param('taskId') taskId: string,
    @Body('deletedById') deletedById: string
  ): Promise<void> {
    await this.commandBus.execute(new DeleteTaskCommand(taskId, deletedById));
  }
}

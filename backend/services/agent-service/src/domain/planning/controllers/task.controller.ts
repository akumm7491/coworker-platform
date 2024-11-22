import { Controller, Get, Post, Put, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TaskRepository } from '../repositories/task.repository';
import { TaskStatus, TaskPriority, TaskType } from '@coworker/shared';
import { Task } from '../entities/task.entity';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskRepository: TaskRepository) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, description: 'Return all tasks', type: [Task] })
  async findAll(
    @Query('projectId') projectId?: string,
    @Query('agentId') agentId?: string
  ): Promise<Task[]> {
    if (projectId) {
      return this.taskRepository.findByProject(projectId);
    }
    if (agentId) {
      return this.taskRepository.findByAssignedAgent(agentId);
    }
    return this.taskRepository.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by id' })
  @ApiResponse({ status: 200, description: 'Return the task', type: Task })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@Param('id') id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully', type: Task })
  async create(@Body() taskData: Partial<Task>): Promise<Task> {
    const task = new Task();

    // Required fields with defaults
    task.status = taskData.status || TaskStatus.PENDING;
    task.priority = taskData.priority || TaskPriority.MEDIUM;
    task.type = taskData.type || TaskType.DEVELOPMENT;
    task.progress = taskData.progress || 0;
    task.tags = taskData.tags || [];
    task.validation_results = taskData.validation_results || [];

    // Required fields that must be provided
    if (!taskData.name) throw new Error('Task name is required');
    if (!taskData.description) throw new Error('Task description is required');
    if (!taskData.requirements) throw new Error('Task requirements are required');
    if (!taskData.dependencies) throw new Error('Task dependencies are required');
    if (!taskData.execution_plan) throw new Error('Task execution plan is required');
    if (!taskData.metrics) throw new Error('Task metrics are required');

    task.name = taskData.name;
    task.description = taskData.description;
    task.requirements = taskData.requirements;
    task.dependencies = taskData.dependencies;
    task.execution_plan = taskData.execution_plan;
    task.metrics = taskData.metrics;

    // Optional fields
    if (taskData.metadata) task.metadata = taskData.metadata;
    if (taskData.project) task.project = taskData.project;
    if (taskData.assigned_agents) task.assigned_agents = taskData.assigned_agents;

    return this.taskRepository.save(task);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiResponse({ status: 200, description: 'Task status updated successfully', type: Task })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async updateStatus(@Param('id') id: string, @Body('status') status: TaskStatus): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    task.status = status;
    return this.taskRepository.save(task);
  }

  @Put(':id/assign')
  @ApiOperation({ summary: 'Assign a task to an agent' })
  @ApiResponse({ status: 200, description: 'Task assigned successfully', type: Task })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async assignToAgent(@Param('id') id: string, @Body('agentId') agentId: string): Promise<void> {
    await this.taskRepository.assignToAgent(id, agentId);
  }
}

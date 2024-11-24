import { Injectable, Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CreateTaskCommand } from '../commands/CreateTaskCommand';
import { UpdateTaskCommand } from '../commands/UpdateTaskCommand';
import { DeleteTaskCommand } from '../commands/DeleteTaskCommand';
import { Task } from '../../domain/models/Task';
import { ITaskRepository } from '../../domain/repositories/ITaskRepository';
import {
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskDeletedEvent,
} from '../../domain/events/TaskEvents';
import { TASK_REPOSITORY } from '../../constants/injection-tokens';
import { TaskNotFoundError } from '../../domain/errors/TaskNotFoundError';

@Injectable()
@CommandHandler(CreateTaskCommand)
export class CreateTaskCommandHandler implements ICommandHandler<CreateTaskCommand> {
  private readonly logger = new Logger(CreateTaskCommandHandler.name);

  constructor(
    private readonly eventBus: EventBus,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository
  ) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    this.logger.debug(`Creating task with command: ${JSON.stringify(command)}`);
    try {
      const task = new Task({
        title: command.title,
        description: command.description,
        createdById: command.createdById,
        assigneeId: command.assigneeId,
        priority: command.priority,
        dueDate: command.dueDate,
        labels: command.labels,
      });

      const savedTask = await this.taskRepository.save(task);
      this.logger.debug(`Task saved successfully: ${JSON.stringify(savedTask)}`);

      const event = new TaskCreatedEvent(
        savedTask.id,
        savedTask.title,
        savedTask.createdById,
        savedTask.assigneeId
      );
      await this.eventBus.publish(event);

      return savedTask;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error creating task: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(UpdateTaskCommand)
export class UpdateTaskCommandHandler implements ICommandHandler<UpdateTaskCommand> {
  private readonly logger = new Logger(UpdateTaskCommandHandler.name);

  constructor(
    private readonly eventBus: EventBus,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository
  ) {}

  async execute(command: UpdateTaskCommand): Promise<Task> {
    this.logger.debug(`Updating task with command: ${JSON.stringify(command)}`);
    try {
      const task = await this.taskRepository.findById(command.taskId);
      if (!task) {
        const error = new TaskNotFoundError(command.taskId);
        this.logger.error(error.message);
        throw error;
      }

      task.update({
        title: command.title,
        description: command.description,
        status: command.status,
        priority: command.priority,
        assigneeId: command.assigneeId,
        dueDate: command.dueDate,
        labels: command.labels,
      });

      const updatedTask = await this.taskRepository.save(task);
      this.logger.debug(`Task updated successfully: ${JSON.stringify(updatedTask)}`);

      const event = new TaskUpdatedEvent(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        assigneeId: updatedTask.assigneeId,
        dueDate: updatedTask.dueDate,
        labels: updatedTask.labels,
      });
      await this.eventBus.publish(event);

      return updatedTask;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error updating task: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(DeleteTaskCommand)
export class DeleteTaskCommandHandler implements ICommandHandler<DeleteTaskCommand> {
  private readonly logger = new Logger(DeleteTaskCommandHandler.name);

  constructor(
    private readonly eventBus: EventBus,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository
  ) {}

  async execute(command: DeleteTaskCommand): Promise<void> {
    this.logger.debug(`Deleting task with command: ${JSON.stringify(command)}`);
    try {
      const task = await this.taskRepository.findById(command.taskId);
      if (!task) {
        const error = new TaskNotFoundError(command.taskId);
        this.logger.error(error.message);
        throw error;
      }

      await this.taskRepository.delete(command.taskId);
      this.logger.debug(`Task deleted successfully: ${command.taskId}`);

      const event = new TaskDeletedEvent(command.taskId, new Date(), command.deletedById);
      await this.eventBus.publish(event);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error deleting task: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}

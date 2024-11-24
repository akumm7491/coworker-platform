import { Injectable, Inject } from '@nestjs/common';
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

@Injectable()
@CommandHandler(CreateTaskCommand)
export class CreateTaskCommandHandler implements ICommandHandler<CreateTaskCommand> {
  constructor(
    private readonly eventBus: EventBus,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository
  ) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
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
    await this.eventBus.publish(
      new TaskCreatedEvent(
        savedTask.id,
        savedTask.title,
        savedTask.createdById,
        savedTask.assigneeId
      )
    );

    return savedTask;
  }
}

@Injectable()
@CommandHandler(UpdateTaskCommand)
export class UpdateTaskCommandHandler implements ICommandHandler<UpdateTaskCommand> {
  constructor(
    private readonly eventBus: EventBus,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository
  ) {}

  async execute(command: UpdateTaskCommand): Promise<Task> {
    console.log('Updating task with ID:', command.taskId);
    console.log('Update payload:', command);
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) {
      throw new Error(`Task with id ${command.taskId} not found`);
    }
    console.log('Found task:', task);

    task.update({
      title: command.title,
      description: command.description,
      assigneeId: command.assigneeId,
      priority: command.priority,
      dueDate: command.dueDate,
      labels: command.labels,
      status: command.status,
    });
    console.log('Task after update:', task);

    try {
      const updatedTask = await this.taskRepository.save(task);
      console.log('Task saved successfully:', updatedTask);
      await this.eventBus.publish(
        new TaskUpdatedEvent(updatedTask.id, {
          title: updatedTask.title,
          assigneeId: updatedTask.assigneeId,
          status: updatedTask.status,
        })
      );
      return updatedTask;
    } catch (error) {
      console.error('Error saving task:', error);
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(DeleteTaskCommand)
export class DeleteTaskCommandHandler implements ICommandHandler<DeleteTaskCommand> {
  constructor(
    private readonly eventBus: EventBus,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository
  ) {}

  async execute(command: DeleteTaskCommand): Promise<void> {
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) {
      throw new Error(`Task with id ${command.taskId} not found`);
    }

    await this.taskRepository.delete(command.taskId);
    await this.eventBus.publish(
      new TaskDeletedEvent(command.taskId, new Date(), command.deletedById)
    );
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CreateTaskCommand } from '../commands/CreateTaskCommand';
import { UpdateTaskCommand } from '../commands/UpdateTaskCommand';
import { Task } from '../../domain/models/Task';
import { ITaskRepository } from '../../domain/repositories/ITaskRepository';
import { TaskCreatedEvent, TaskUpdatedEvent } from '../../domain/events/TaskEvents';
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
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) {
      throw new Error(`Task with id ${command.taskId} not found`);
    }

    task.update({
      title: command.title,
      description: command.description,
      assigneeId: command.assigneeId,
      priority: command.priority,
      dueDate: command.dueDate,
      labels: command.labels,
      status: command.status,
    });

    const updatedTask = await this.taskRepository.save(task);
    await this.eventBus.publish(
      new TaskUpdatedEvent(updatedTask.id, {
        title: updatedTask.title,
        assigneeId: updatedTask.assigneeId,
        status: updatedTask.status,
      })
    );

    return updatedTask;
  }
}

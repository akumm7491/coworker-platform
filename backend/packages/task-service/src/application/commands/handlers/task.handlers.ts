import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import {
  CreateTaskCommand,
  AssignTaskCommand,
  UpdateTaskStatusCommand,
  UpdateTaskProgressCommand,
  DeleteTaskCommand,
} from '../index';
import { Task } from '../../../domain/entities/Task';
import { TaskStatus, TaskPriority, TaskType } from '../../../domain/types/task.types';

@CommandHandler(CreateTaskCommand)
export class CreateTaskCommandHandler implements ICommandHandler<CreateTaskCommand> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CreateTaskCommand) {
    const taskResult = Task.create(
      await this.taskRepository.nextIdentity(),
      command.title,
      command.description,
      TaskType.DEVELOPMENT, // Default type, should come from command
    );

    if (taskResult.isFailure) {
      throw new Error(taskResult.error);
    }

    const task = this.publisher.mergeObjectContext(taskResult.getValue());
    await this.taskRepository.save(task);
    task.commit();

    return task;
  }
}

@CommandHandler(AssignTaskCommand)
export class AssignTaskCommandHandler implements ICommandHandler<AssignTaskCommand> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: AssignTaskCommand) {
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const publishedTask = this.publisher.mergeObjectContext(task);
    publishedTask.assign(command.agentId);
    await this.taskRepository.save(publishedTask);
    publishedTask.commit();

    return publishedTask;
  }
}

@CommandHandler(UpdateTaskStatusCommand)
export class UpdateTaskStatusCommandHandler implements ICommandHandler<UpdateTaskStatusCommand> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: UpdateTaskStatusCommand) {
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const publishedTask = this.publisher.mergeObjectContext(task);
    publishedTask.updateStatus(command.status as TaskStatus);
    await this.taskRepository.save(publishedTask);
    publishedTask.commit();

    return publishedTask;
  }
}

@CommandHandler(UpdateTaskProgressCommand)
export class UpdateTaskProgressCommandHandler implements ICommandHandler<UpdateTaskProgressCommand> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: UpdateTaskProgressCommand) {
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const publishedTask = this.publisher.mergeObjectContext(task);
    publishedTask.updateProgress(command.progress);
    await this.taskRepository.save(publishedTask);
    publishedTask.commit();

    return publishedTask;
  }
}

@CommandHandler(DeleteTaskCommand)
export class DeleteTaskCommandHandler implements ICommandHandler<DeleteTaskCommand> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: DeleteTaskCommand) {
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const publishedTask = this.publisher.mergeObjectContext(task);
    publishedTask.delete(command.reason);
    await this.taskRepository.delete(command.taskId);
    publishedTask.commit();

    return true;
  }
}

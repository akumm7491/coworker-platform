import { BaseTestBuilder } from '@shared-kernel/testing/BaseTestBuilder';
import { Task } from '../Task';
import { TaskStatus, TaskPriority } from '../TaskStatus';
import { randomUUID } from 'crypto';

export class TaskBuilder extends BaseTestBuilder<Task> {
  constructor() {
    super();
    const task = new Task();
    task.id = randomUUID();
    task.title = 'Test Task';
    task.description = 'Test Description';
    task.status = TaskStatus.TODO;
    task.priority = TaskPriority.MEDIUM;
    task.createdById = randomUUID(); // Add createdById
    task.createdAt = new Date();
    task.updatedAt = new Date();
    task.labels = [];
    this.entity = task;
  }

  public withTitle(title: string): this {
    return this.with('title', title);
  }

  public withStatus(status: TaskStatus): this {
    return this.with('status', status);
  }

  public withPriority(priority: TaskPriority): this {
    return this.with('priority', priority);
  }

  public withCreatedById(createdById: string): this {
    return this.with('createdById', createdById);
  }

  static aTask(): TaskBuilder {
    return new TaskBuilder();
  }
}

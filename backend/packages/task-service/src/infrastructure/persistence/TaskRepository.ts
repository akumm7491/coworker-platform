import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITaskRepository } from '../../domain/repositories/ITaskRepository';
import { Task } from '../../domain/entities/Task';
import { Result } from '@coworker-platform/shared-kernel';
import { EventBus } from '@nestjs/cqrs';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly eventBus: EventBus,
  ) {}

  async save(task: Task): Promise<Result<void>> {
    try {
      await this.taskRepository.save(task);
      
      // Publish domain events
      const events = task.getDomainEvents();
      events.forEach(event => this.eventBus.publish(event));
      task.clearDomainEvents();
      
      return Result.ok();
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  async findById(id: string): Promise<Result<Task>> {
    try {
      const task = await this.taskRepository.findOne({ where: { id } });
      if (!task) {
        return Result.fail(`Task with id ${id} not found`);
      }
      return Result.ok(task);
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  async findAll(): Promise<Result<Task[]>> {
    try {
      const tasks = await this.taskRepository.find();
      return Result.ok(tasks);
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const deleteResult = await this.taskRepository.delete(id);
      if (deleteResult.affected === 0) {
        return Result.fail(`Task with id ${id} not found`);
      }
      return Result.ok();
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  // Implement other repository methods...
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../domain/models/Task';
import { TaskFilter, TaskQueryOptions } from '../../domain/repositories/ITaskRepository';

@Injectable()
export class TaskRepository {
  constructor(
    @InjectRepository(Task)
    private readonly repository: Repository<Task>
  ) {}

  async findById(id: string): Promise<Task | null> {
    return this.repository.findOne({ where: { id } });
  }

  async save(entity: Task): Promise<Task> {
    return this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByFilter(filter: TaskFilter): Promise<Task[]> {
    const queryBuilder = this.repository.createQueryBuilder('task');

    if (filter.status) {
      queryBuilder.andWhere('task.status = :status', { status: filter.status });
    }
    if (filter.assigneeId) {
      queryBuilder.andWhere('task.assigneeId = :assigneeId', { assigneeId: filter.assigneeId });
    }
    if (filter.createdById) {
      queryBuilder.andWhere('task.createdById = :createdById', { createdById: filter.createdById });
    }
    if (filter.labelId) {
      queryBuilder.andWhere(':labelId = ANY(task.labels)', { labelId: filter.labelId });
    }
    if (filter.dueBefore) {
      queryBuilder.andWhere('task.dueDate <= :dueBefore', { dueBefore: filter.dueBefore });
    }
    if (filter.dueAfter) {
      queryBuilder.andWhere('task.dueDate >= :dueAfter', { dueAfter: filter.dueAfter });
    }

    return queryBuilder.getMany();
  }

  async findAll(options: TaskQueryOptions): Promise<Task[]> {
    const queryBuilder = this.repository.createQueryBuilder('task');

    if (options.status) {
      queryBuilder.andWhere('task.status = :status', { status: options.status });
    }
    if (options.assigneeId) {
      queryBuilder.andWhere('task.assigneeId = :assigneeId', { assigneeId: options.assigneeId });
    }
    if (options.createdById) {
      queryBuilder.andWhere('task.createdById = :createdById', {
        createdById: options.createdById,
      });
    }
    if (options.labelId) {
      queryBuilder.andWhere(':labelId = ANY(task.labels)', { labelId: options.labelId });
    }

    if (options.skip) {
      queryBuilder.skip(options.skip);
    }
    if (options.take) {
      queryBuilder.take(options.take);
    }

    if (options.orderBy) {
      Object.entries(options.orderBy).forEach(([key, value]) => {
        queryBuilder.addOrderBy(`task.${key}`, value);
      });
    }

    return queryBuilder.getMany();
  }

  async count(filter: TaskFilter): Promise<number> {
    const queryBuilder = this.repository.createQueryBuilder('task');

    if (filter.status) {
      queryBuilder.andWhere('task.status = :status', { status: filter.status });
    }
    if (filter.assigneeId) {
      queryBuilder.andWhere('task.assigneeId = :assigneeId', { assigneeId: filter.assigneeId });
    }
    if (filter.createdById) {
      queryBuilder.andWhere('task.createdById = :createdById', { createdById: filter.createdById });
    }
    if (filter.labelId) {
      queryBuilder.andWhere(':labelId = ANY(task.labels)', { labelId: filter.labelId });
    }

    return queryBuilder.getCount();
  }
}

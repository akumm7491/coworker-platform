import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DomainRepository } from '@coworker/shared-kernel';
import { Task } from '../../domain/models/Task';
import {
  ITaskRepository,
  TaskFilter,
  TaskQueryOptions,
} from '../../domain/repositories/ITaskRepository';

@Injectable()
export class TaskRepository extends DomainRepository<Task> implements ITaskRepository {
  constructor(
    @InjectRepository(Task)
    repository: Repository<Task>
  ) {
    super(repository);
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

    // Apply filters
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
    if (options.dueBefore) {
      queryBuilder.andWhere('task.dueDate <= :dueBefore', { dueBefore: options.dueBefore });
    }
    if (options.dueAfter) {
      queryBuilder.andWhere('task.dueDate >= :dueAfter', { dueAfter: options.dueAfter });
    }

    // Apply pagination
    if (options.skip) {
      queryBuilder.skip(options.skip);
    }
    if (options.take) {
      queryBuilder.take(options.take);
    }

    // Apply ordering
    if (options.orderBy) {
      Object.entries(options.orderBy).forEach(([field, direction]) => {
        queryBuilder.addOrderBy(`task.${field}`, direction);
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
    if (filter.dueBefore) {
      queryBuilder.andWhere('task.dueDate <= :dueBefore', { dueBefore: filter.dueBefore });
    }
    if (filter.dueAfter) {
      queryBuilder.andWhere('task.dueDate >= :dueAfter', { dueAfter: filter.dueAfter });
    }

    return queryBuilder.getCount();
  }
}

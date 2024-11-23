import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { GetTaskQuery, GetTasksQuery } from '../index';

@QueryHandler(GetTaskQuery)
export class GetTaskQueryHandler implements IQueryHandler<GetTaskQuery> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(query: GetTaskQuery) {
    const task = await this.taskRepository.findById(query.taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }
}

@QueryHandler(GetTasksQuery)
export class GetTasksQueryHandler implements IQueryHandler<GetTasksQuery> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(query: GetTasksQuery) {
    const { status, priority, assignedTo } = query;
    const filters = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assignedTo && { assignedTo }),
    };
    
    return this.taskRepository.findAll(filters);
  }
}

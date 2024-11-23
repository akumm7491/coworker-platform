import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaskQuery } from '../queries/GetTaskQuery';
import { ListTasksQuery } from '../queries/ListTasksQuery';
import { Task } from '../../domain/models/Task';
import { ITaskRepository } from '../../domain/repositories/ITaskRepository';
import { Injectable, Inject } from '@nestjs/common';
import { TASK_REPOSITORY } from '../../constants/injection-tokens';

@Injectable()
@QueryHandler(GetTaskQuery)
export class GetTaskQueryHandler implements IQueryHandler<GetTaskQuery> {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository
  ) {}

  async execute(query: GetTaskQuery): Promise<Task> {
    const task = await this.taskRepository.findById(query.taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }
}

@Injectable()
@QueryHandler(ListTasksQuery)
export class ListTasksQueryHandler implements IQueryHandler<ListTasksQuery> {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository
  ) {}

  async execute(query: ListTasksQuery): Promise<{ tasks: Task[]; total: number }> {
    const { assigneeId, status, priority, labels, page, pageSize } = query;

    const filters = {
      ...(assigneeId && { assigneeId }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(labels?.length && { labels }),
    };

    const [tasks, total] = await Promise.all([
      this.taskRepository.findAll({
        ...filters,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.taskRepository.count(filters),
    ]);

    return { tasks, total };
  }
}

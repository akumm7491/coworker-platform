import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { GetTaskQuery } from '../queries/GetTaskQuery';
import { ListTasksQuery } from '../queries/ListTasksQuery';
import { Task } from '../../domain/models/Task';
import { ITaskRepository, TaskQueryOptions } from '../../domain/repositories/ITaskRepository';
import { TASK_REPOSITORY } from '../../constants/injection-tokens';
import { TaskNotFoundError } from '../../domain/errors/TaskNotFoundError';

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
      throw new TaskNotFoundError(query.taskId);
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
    const queryOptions: TaskQueryOptions = {
      status: query.status,
      assigneeId: query.assigneeId,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { createdAt: 'DESC' },
    };
    const [tasks, total] = await Promise.all([
      this.taskRepository.findAll(queryOptions),
      this.taskRepository.count(queryOptions),
    ]);
    return { tasks, total };
  }
}

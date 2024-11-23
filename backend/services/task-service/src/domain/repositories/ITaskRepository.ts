import { Task } from '../models/Task';
import { TaskStatus } from '../models/TaskStatus';
import { IDomainRepository } from '@coworker/shared-kernel';

export interface TaskFilter {
  status?: TaskStatus;
  assigneeId?: string;
  createdById?: string;
  labelId?: string;
  dueBefore?: Date;
  dueAfter?: Date;
}

export interface TaskQueryOptions extends TaskFilter {
  skip?: number;
  take?: number;
  orderBy?: {
    [key: string]: 'ASC' | 'DESC';
  };
}

export interface ITaskRepository extends IDomainRepository<Task> {
  findByFilter(filter: TaskFilter): Promise<Task[]>;
  findAll(options: TaskQueryOptions): Promise<Task[]>;
  count(filter: TaskFilter): Promise<number>;
}

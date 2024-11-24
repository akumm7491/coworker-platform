import { DomainError } from '@coworker/shared-kernel';

export class TaskNotFoundError extends DomainError {
  constructor(taskId: string) {
    super(`Task with id ${taskId} not found`);
    this.name = 'TaskNotFoundError';
  }
}

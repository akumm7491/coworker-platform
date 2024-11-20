import { Logger } from 'winston';
import { TaskResult } from './types.js';

export interface TaskHandler {
  execute(parameters: Record<string, unknown>): Promise<unknown>;
}

export class AgentTaskExecutor {
  private taskHandlers: Map<string, TaskHandler>;
  private runningTasks: Map<string, Promise<unknown>>;
  private taskResults: Map<string, TaskResult>;

  constructor(private readonly logger: Logger) {
    this.taskHandlers = new Map();
    this.runningTasks = new Map();
    this.taskResults = new Map();
  }

  registerTaskHandler(taskType: string, handler: TaskHandler): void {
    if (this.taskHandlers.has(taskType)) {
      throw new Error(`Handler already registered for task type: ${taskType}`);
    }
    this.taskHandlers.set(taskType, handler);
    this.logger.info('Registered task handler', { taskType });
  }

  async executeTask(
    taskId: string,
    taskType: string,
    parameters: Record<string, unknown>,
  ): Promise<void> {
    const handler = this.taskHandlers.get(taskType);
    if (!handler) {
      throw new Error(`No handler registered for task type: ${taskType}`);
    }

    this.logger.info('Starting task execution', { taskId, taskType });

    const taskPromise = handler
      .execute(parameters)
      .then(result => {
        const taskResult: TaskResult = {
          taskId,
          result,
          status: 'SUCCESS' as const,
        };
        this.taskResults.set(taskId, taskResult);
        this.logger.info('Task completed successfully', { taskId, taskType });
      })
      .catch(error => {
        const taskResult: TaskResult = {
          taskId,
          result: null,
          status: 'FAILURE' as const,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        this.taskResults.set(taskId, taskResult);
        this.logger.error('Task failed', {
          taskId,
          taskType,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      })
      .finally(() => {
        this.runningTasks.delete(taskId);
      });

    this.runningTasks.set(taskId, taskPromise);
  }

  async checkTaskStatus(taskId: string): Promise<TaskResult | null> {
    // If task is still running, return null
    if (this.runningTasks.has(taskId)) {
      return null;
    }

    // If we have a result, return and clear it
    const result = this.taskResults.get(taskId);
    if (result) {
      this.taskResults.delete(taskId);
      return result;
    }

    return null;
  }

  getRegisteredTaskTypes(): string[] {
    return Array.from(this.taskHandlers.keys());
  }
}

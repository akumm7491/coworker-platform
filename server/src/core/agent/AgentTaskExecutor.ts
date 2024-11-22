import { Logger } from 'winston';

export type TaskStatus = 'SUCCESS' | 'FAILURE';

export interface TaskHandler {
  execute(parameters: Record<string, unknown>): Promise<unknown>;
}

export interface TaskResult {
  result?: unknown;
  status: TaskStatus;
  error?: string;
}

export class AgentTaskExecutor {
  private taskHandlers: Map<string, TaskHandler>;
  private runningTasks: Map<
    string,
    {
      promise: Promise<unknown>;
      cancel?: () => void;
      startTime: number;
    }
  >;
  private readonly defaultTimeout: number;

  constructor(
    private readonly logger: Logger,
    config?: { defaultTimeout?: number },
  ) {
    this.taskHandlers = new Map();
    this.runningTasks = new Map();
    this.defaultTimeout = config?.defaultTimeout ?? 300000; // Default 5 minutes
  }

  registerTaskHandler(taskType: string, handler: TaskHandler): void {
    if (this.taskHandlers.has(taskType)) {
      throw new Error(`Task handler for type ${taskType} is already registered`);
    }
    this.taskHandlers.set(taskType, handler);
    this.logger.info('Registered task handler', { taskType });
  }

  async executeTask(
    taskId: string,
    taskType: string,
    parameters: Record<string, unknown>,
    timeout?: number,
  ): Promise<void> {
    const handler = this.taskHandlers.get(taskType);
    if (!handler) {
      throw new Error(`No handler registered for task type ${taskType}`);
    }

    let cancel: (() => void) | undefined;
    const taskPromise = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Task ${taskId} timed out after ${timeout ?? this.defaultTimeout}ms`));
      }, timeout ?? this.defaultTimeout);

      cancel = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Task ${taskId} was cancelled`));
      };

      try {
        handler
          .execute(parameters)
          .then(result => {
            clearTimeout(timeoutId);
            resolve(result);
          })
          .catch(error => {
            clearTimeout(timeoutId);
            reject(error);
          });
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });

    this.runningTasks.set(taskId, {
      promise: taskPromise,
      cancel,
      startTime: Date.now(),
    });

    try {
      await taskPromise;
    } finally {
      this.runningTasks.delete(taskId);
    }
  }

  async checkTaskStatus(taskId: string): Promise<TaskResult | null> {
    const task = this.runningTasks.get(taskId);
    if (!task) {
      return null;
    }

    try {
      const result = await Promise.race([
        task.promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Task status check timed out')), 5000),
        ),
      ]);

      return {
        result,
        status: 'SUCCESS' as const,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        status: 'FAILURE' as const,
      };
    }
  }

  cancelTask(taskId: string): void {
    const task = this.runningTasks.get(taskId);
    if (!task) {
      this.logger.warn(`Attempted to cancel non-existent task ${taskId}`);
      return;
    }

    task.cancel?.();
    this.runningTasks.delete(taskId);
    this.logger.info(`Task ${taskId} cancelled`);
  }

  getRunningTasks(): { taskId: string; startTime: number; runtime: number }[] {
    return Array.from(this.runningTasks.entries()).map(([taskId, task]) => ({
      taskId,
      startTime: task.startTime,
      runtime: Date.now() - task.startTime,
    }));
  }

  getRegisteredTaskTypes(): string[] {
    return Array.from(this.taskHandlers.keys());
  }
}

import { Logger } from 'winston';
import { EventBus } from '../events/EventBus.js';
import { CommandBus } from '../commands/CommandBus.js';
import { AgentReadModelRepository } from '../readmodels/AgentReadModelRepository.js';
import { createCompleteTaskCommand } from '../commands/agent/AgentCommands.js';
import { AgentTaskExecutor } from './AgentTaskExecutor.js';

export class AgentRunner {
  private isRunning = false;
  private currentTaskId: string | null = null;

  constructor(
    private readonly agentId: string,
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus,
    private readonly agentRepository: AgentReadModelRepository,
    private readonly taskExecutor: AgentTaskExecutor,
    private readonly logger: Logger,
  ) {}

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.logger.info('Starting agent runner', { agentId: this.agentId });

    while (this.isRunning) {
      try {
        const agent = await this.agentRepository.findById(this.agentId);
        if (!agent) {
          throw new Error(`Agent ${this.agentId} not found`);
        }

        if (agent.status === 'BUSY' && this.currentTaskId) {
          // Continue executing current task
          const taskResult = await this.taskExecutor.checkTaskStatus(this.currentTaskId);
          if (taskResult) {
            // Task completed, report result
            await this.commandBus.dispatch(
              createCompleteTaskCommand(
                {
                  taskId: this.currentTaskId,
                  result: taskResult.result,
                  status: taskResult.status,
                  error: taskResult.error,
                },
                {
                  userId: 'system',
                  timestamp: new Date().toISOString(),
                  correlationId: this.currentTaskId,
                },
              ),
            );
            this.currentTaskId = null;
          }
        }

        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        this.logger.error('Error in agent runner loop', {
          agentId: this.agentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  stop(): void {
    this.isRunning = false;
    this.logger.info('Stopping agent runner', { agentId: this.agentId });
  }

  async executeTask(
    taskId: string,
    taskType: string,
    parameters: Record<string, unknown>,
  ): Promise<void> {
    if (this.currentTaskId) {
      throw new Error('Agent is already executing a task');
    }

    this.currentTaskId = taskId;
    await this.taskExecutor.executeTask(taskId, taskType, parameters);
  }
}

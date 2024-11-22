import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AgentBaseService } from '../base/AgentBaseService.js';
import { TaskExecution } from '../../shared/database/entities/TaskExecution.js';
import { AgentEventType } from '../../shared/events/EventTypes.js';
import { MetricsService } from '../../shared/metrics/MetricsService.js';
import { QueueService } from '../../shared/queue/QueueService.js';
import { AgentService } from '../../shared/ai/AgentService.js';
import { StorageService } from '../../shared/storage/StorageService.js';
import { CircuitBreakerRegistry } from '../../shared/resilience/CircuitBreakerRegistry.js';
import { EventBus } from '../../shared/events/EventBus.js';
import { Logger } from 'winston';
import logger from '../../../utils/logger.js';

@Service()
export class TaskExecutorService extends AgentBaseService<TaskExecution> {
  private static instance: TaskExecutorService;
  protected readonly logger: Logger = logger;

  public static getInstance(): TaskExecutorService {
    if (!TaskExecutorService.instance) {
      const repository = Container.get<Repository<TaskExecution>>(
        'typeorm.repository.TaskExecution'
      );
      TaskExecutorService.instance = new TaskExecutorService(
        repository,
        metricsService,
        queueService,
        agentService,
        storageService,
        circuitBreakerRegistry,
        EventBus.getInstance()
      );
    }
    return TaskExecutorService.instance;
  }

  private constructor(
    repository: Repository<TaskExecution>,
    metrics: MetricsService,
    queue: QueueService,
    private readonly agentService: AgentService,
    private readonly storageService: StorageService,
    private readonly circuitBreaker: CircuitBreakerRegistry,
    eventBus: EventBus
  ) {
    super(repository, 'TaskExecution', 'task_executor', metrics, queue, eventBus);
  }

  protected async setupEventHandlers(): Promise<void> {
    await super.setupEventHandlers();
    this.eventBus.subscribe<TaskEventPayload>(
      AgentEventType.TASK_ASSIGNED,
      async event => await this.handleTaskAssigned(event)
    );
  }

  private async handleTaskAssigned(event: Event<TaskEventPayload>): Promise<void> {
    const { taskId, agentId } = event.payload;
    const execution = await this.create({
      task: taskId,
      agent: agentId,
      status: 'pending',
      startTime: new Date(),
      logs: [],
      metrics: {},
    });

    await this.publishEvent(AgentEventType.TASK_EXECUTION_STARTED, {
      taskId,
      agentId,
      executionId: execution.id,
    });

    await this.enqueueTask(execution);
  }

  async queueTask(taskId: string, agentId: string): Promise<TaskExecution> {
    const execution = await this.create({
      task: taskId,
      agent: agentId,
      status: 'pending',
      startTime: new Date(),
      logs: [],
      metrics: {},
    });

    await this.publishEvent(AgentEventType.TASK_EXECUTION_QUEUED, {
      taskId,
      agentId,
      executionId: execution.id,
    });

    return execution;
  }

  async cancelTask(executionId: string): Promise<void> {
    await this.update(executionId, {
      status: 'cancelled',
      endTime: new Date(),
    });

    await this.publishEvent(AgentEventType.TASK_EXECUTION_CANCELLED, {
      executionId,
    });
  }

  private async executeTask(execution: TaskExecution): Promise<void> {
    try {
      const agent = await this.agentService.prepareAgent(execution.agent);
      const task = await this.repository.manager
        .getRepository('Task')
        .findOne({ where: { id: execution.task } });

      if (!task) {
        throw new Error(`Task ${execution.task} not found`);
      }

      await this.update(execution.id, {
        status: 'running',
        logs: [],
      });

      const result = await agent.executeTask(task, execution.logs);

      await this.update(execution.id, {
        status: 'completed',
        endTime: new Date(),
        result,
        metrics: {
          executionTime: Date.now() - execution.startTime.getTime(),
          memoryUsage: process.memoryUsage().heapUsed,
        },
      });

      await this.publishEvent(AgentEventType.TASK_EXECUTION_COMPLETED, {
        executionId: execution.id,
        result,
      });
    } catch (error) {
      await this.handleExecutionError(execution, error);
    }
  }

  private async handleExecutionError(execution: TaskExecution, error: Error): Promise<void> {
    await this.update(execution.id, {
      status: 'failed',
      endTime: new Date(),
      error: error.message,
    });

    await this.publishEvent(AgentEventType.TASK_EXECUTION_FAILED, {
      executionId: execution.id,
      error: error.message,
    });
  }
}

export const taskExecutorService = TaskExecutorService.getInstance();

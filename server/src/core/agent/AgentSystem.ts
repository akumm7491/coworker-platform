import { Logger } from 'winston';
import { Pool, PoolConfig } from 'pg';
import { EventBus } from '../events/EventBus.js';
import { CommandBus } from '../commands/CommandBus.js';
import { PostgresEventStore } from '../events/PostgresEventStore.js';
import { AgentReadModelRepository } from '../readmodels/AgentReadModelRepository.js';
import { EventProcessor } from '../readmodels/EventProcessor.js';
import { createAgentCommandHandlers } from '../commands/agent/AgentCommandHandlers.js';
import { AgentRunner } from './AgentRunner.js';
import { AgentTaskExecutor } from './AgentTaskExecutor.js';
import {
  ProjectTaskTypes,
  CreateProjectTaskHandler,
  UpdateProjectTaskHandler,
  AnalyzeProjectTaskHandler,
} from './tasks/ProjectManagementTasks.js';

export interface AgentSystemConfig {
  pool: PoolConfig;
  logger: Logger;
}

export class AgentSystem {
  private eventStore: PostgresEventStore;
  private eventBus: EventBus;
  private commandBus: CommandBus;
  private agentRepository: AgentReadModelRepository;
  private eventProcessor: EventProcessor;
  private taskExecutor: AgentTaskExecutor;
  private runners: Map<string, AgentRunner>;
  private pool: Pool;

  constructor(private readonly config: AgentSystemConfig) {
    this.runners = new Map();
    this.pool = new Pool(this.config.pool as PoolConfig);
  }

  async initialize(): Promise<void> {
    // Initialize event store
    this.eventStore = new PostgresEventStore(this.config.pool, {}, this.config.logger);

    // Initialize event bus
    this.eventBus = new EventBus(this.config.logger);

    // Initialize command bus
    this.commandBus = new CommandBus(this.eventBus, this.config.logger);

    // Initialize agent repository
    this.agentRepository = new AgentReadModelRepository(this.pool, this.config.logger);

    // Initialize task executor with default task handlers
    this.taskExecutor = new AgentTaskExecutor(this.config.logger);
    this.registerDefaultTaskHandlers();

    // Register command handlers
    const commandHandlers = createAgentCommandHandlers(this.eventStore, this.config.logger);
    for (const [type, handler] of commandHandlers) {
      this.commandBus.register(type, handler);
    }

    // Initialize event processor
    const processors = new Map();
    // Add event processors here
    this.eventProcessor = new EventProcessor(this.eventStore, this.config.logger, processors);

    // Start event processing
    await this.eventProcessor.startProcessing();
  }

  private registerDefaultTaskHandlers(): void {
    this.taskExecutor.registerTaskHandler(
      ProjectTaskTypes.CREATE_PROJECT,
      new CreateProjectTaskHandler(),
    );
    this.taskExecutor.registerTaskHandler(
      ProjectTaskTypes.UPDATE_PROJECT,
      new UpdateProjectTaskHandler(),
    );
    this.taskExecutor.registerTaskHandler(
      ProjectTaskTypes.ANALYZE_PROJECT,
      new AnalyzeProjectTaskHandler(),
    );
  }

  async startAgent(agentId: string): Promise<void> {
    if (this.runners.has(agentId)) {
      throw new Error(`Agent ${agentId} is already running`);
    }

    const runner = new AgentRunner(
      agentId,
      this.eventBus,
      this.commandBus,
      this.agentRepository,
      this.taskExecutor,
      this.config.logger,
    );

    this.runners.set(agentId, runner);
    await runner.start();
  }

  async stopAgent(agentId: string): Promise<void> {
    const runner = this.runners.get(agentId);
    if (!runner) {
      throw new Error(`Agent ${agentId} is not running`);
    }

    runner.stop();
    this.runners.delete(agentId);
  }

  async shutdown(): Promise<void> {
    // Stop all agent runners
    for (const [agentId, runner] of this.runners) {
      this.config.logger.info(`Shutting down agent: ${agentId}`);
      runner.stop();
    }
    this.runners.clear();

    // Stop event processing
    this.eventProcessor.stopProcessing();
  }

  getRunningAgents(): string[] {
    return Array.from(this.runners.keys());
  }
}

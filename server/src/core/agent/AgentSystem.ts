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
  maxConcurrentAgents?: number;
  healthCheckInterval?: number;
}

export interface AgentSystemState {
  isInitialized: boolean;
  runningAgents: string[];
  systemHealth: {
    eventStoreConnected: boolean;
    databaseConnected: boolean;
    lastHealthCheck: string;
  };
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
  private isInitialized = false;
  private healthCheckInterval?: ReturnType<typeof setInterval>;
  private readonly maxConcurrentAgents: number;

  constructor(private readonly config: AgentSystemConfig) {
    this.runners = new Map();
    this.pool = new Pool(this.config.pool as PoolConfig);
    this.maxConcurrentAgents = config.maxConcurrentAgents ?? 10;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('AgentSystem is already initialized');
    }

    try {
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

      // Start health monitoring if interval is specified
      if (this.config.healthCheckInterval) {
        this.startHealthMonitoring();
      }

      this.isInitialized = true;
      this.config.logger.info('AgentSystem initialized successfully');
    } catch (error) {
      this.config.logger.error('Failed to initialize AgentSystem', { error });
      throw error;
    }
  }

  private async startHealthMonitoring(): Promise<void> {
    const interval = this.config.healthCheckInterval ?? 30000; // Default to 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.checkHealth();
        this.config.logger.debug('Health check completed', { health });
      } catch (error) {
        this.config.logger.error('Health check failed', { error });
      }
    }, interval);
  }

  async startAgent(agentId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('AgentSystem must be initialized before starting agents');
    }

    if (this.runners.size >= this.maxConcurrentAgents) {
      throw new Error(`Maximum number of concurrent agents (${this.maxConcurrentAgents}) reached`);
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

  async stopAgent(agentId: string, force = false): Promise<void> {
    const runner = this.runners.get(agentId);
    if (!runner) {
      throw new Error(`Agent ${agentId} is not running`);
    }

    try {
      if (force) {
        runner.stop();
      } else {
        await runner.gracefulStop();
      }
      this.runners.delete(agentId);
      this.config.logger.info(`Agent ${agentId} stopped successfully`);
    } catch (error) {
      this.config.logger.error(`Failed to stop agent ${agentId}`, { error });
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    this.config.logger.info('Shutting down AgentSystem...');

    // Stop health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Stop all agent runners gracefully
    const stopPromises = Array.from(this.runners.entries()).map(async ([agentId, runner]) => {
      this.config.logger.info(`Starting shutdown for agent ${agentId} with runner ${runner}`);
      try {
        await this.stopAgent(agentId);
      } catch (error) {
        this.config.logger.error(`Failed to stop agent ${agentId}`, { error });
      }
    });

    await Promise.all(stopPromises);

    // Stop event processing
    await this.eventProcessor.stopProcessing();

    // Close database connections
    await this.pool.end();

    this.isInitialized = false;
    this.config.logger.info('AgentSystem shutdown completed');
  }

  async checkHealth(): Promise<AgentSystemState['systemHealth']> {
    const health = {
      eventStoreConnected: false,
      databaseConnected: false,
      lastHealthCheck: new Date().toISOString(),
    };

    try {
      // Check event store connection by running a simple query
      await this.eventStore.getLastPosition();
      health.eventStoreConnected = true;
    } catch (error) {
      this.config.logger.error('Event store health check failed', { error });
    }

    try {
      // Check database connection
      await this.pool.query('SELECT 1');
      health.databaseConnected = true;
    } catch (error) {
      this.config.logger.error('Database health check failed', { error });
    }

    return health;
  }

  getSystemState(): AgentSystemState {
    return {
      isInitialized: this.isInitialized,
      runningAgents: this.getRunningAgents(),
      systemHealth: {
        eventStoreConnected: false,
        databaseConnected: false,
        lastHealthCheck: new Date().toISOString(),
      },
    };
  }

  getRunningAgents(): string[] {
    return Array.from(this.runners.keys());
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
}

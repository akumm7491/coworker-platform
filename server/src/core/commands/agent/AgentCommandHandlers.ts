import { Logger } from 'winston';
import { Command, CommandHandler } from '../types.js';
import { EventStore } from '../../events/types.js';
import { Agent } from '../../domain/Agent.js';
import {
  CreateAgentPayload,
  UpdateAgentPayload,
  AssignTaskPayload,
  CompleteTaskPayload,
  AgentCommandTypes,
} from './AgentCommands.js';
import {
  createAgentCreatedEvent,
  createAgentUpdatedEvent,
  createAgentTaskAssignedEvent,
  createAgentTaskCompletedEvent,
} from '../../events/examples/AgentEvents.js';
import { v4 as uuidv4 } from 'uuid';

export class CreateAgentCommandHandler implements CommandHandler {
  constructor(
    private readonly eventStore: EventStore,
    private readonly logger: Logger,
  ) {}

  async handle(command: Command<CreateAgentPayload>): Promise<void> {
    const { payload, metadata } = command;
    const agentId = metadata.agentId || uuidv4();
    const agent = new Agent(agentId);

    const event = createAgentCreatedEvent(
      agent.id,
      {
        name: payload.name,
        type: 'agent',
        capabilities: {
          skills: payload.capabilities,
          languages: [],
        },
        settings: payload.configuration || {},
      },
      {
        userId: metadata.userId,
        timestamp: new Date(metadata.timestamp),
        correlationId: metadata.correlationId,
        causationId: metadata.causationId,
      },
    );

    await this.eventStore.append([event]);
    this.logger.info('Agent created', { agentId: agent.id, name: payload.name });
  }
}

export class UpdateAgentCommandHandler implements CommandHandler {
  constructor(
    private readonly eventStore: EventStore,
    private readonly logger: Logger,
  ) {}

  async handle(command: Command<UpdateAgentPayload>): Promise<void> {
    const { payload, metadata } = command;
    const agentId = metadata.agentId || uuidv4();

    const events = await this.eventStore.getEvents(agentId);
    const agent = new Agent(agentId);
    agent.loadFromHistory(events);

    const event = createAgentUpdatedEvent(
      agentId,
      {
        name: payload.name,
        type: 'agent',
        capabilities: {
          skills: payload.capabilities,
          languages: [],
        },
        settings: payload.configuration || {},
      },
      {
        userId: metadata.userId,
        timestamp: new Date(metadata.timestamp),
        correlationId: metadata.correlationId,
        causationId: metadata.causationId,
      },
    );

    await this.eventStore.append([event], agent.version);
    this.logger.info('Agent updated', { agentId });
  }
}

export class AssignTaskCommandHandler implements CommandHandler {
  constructor(
    private readonly eventStore: EventStore,
    private readonly logger: Logger,
  ) {}

  async handle(command: Command<AssignTaskPayload>): Promise<void> {
    const { payload, metadata } = command;
    const agentId = metadata.agentId || uuidv4();

    const events = await this.eventStore.getEvents(agentId);
    const agent = new Agent(agentId);
    agent.loadFromHistory(events);

    if (agent.status !== 'IDLE') {
      throw new Error(`Agent ${agentId} is not available for tasks`);
    }

    const event = createAgentTaskAssignedEvent(agentId, payload, {
      userId: metadata.userId,
      timestamp: new Date(metadata.timestamp),
      correlationId: metadata.correlationId,
      causationId: metadata.causationId,
    });

    await this.eventStore.append([event], agent.version);
    this.logger.info('Task assigned to agent', { agentId, taskId: payload.taskId });
  }
}

export class CompleteTaskCommandHandler implements CommandHandler {
  constructor(
    private readonly eventStore: EventStore,
    private readonly logger: Logger,
  ) {}

  async handle(command: Command<CompleteTaskPayload>): Promise<void> {
    const { payload, metadata } = command;
    const agentId = metadata.agentId || uuidv4();

    const events = await this.eventStore.getEvents(agentId);
    const agent = new Agent(agentId);
    agent.loadFromHistory(events);

    const event = createAgentTaskCompletedEvent(
      agentId,
      {
        taskId: payload.taskId, // Ensure taskId is always provided
        status: 'SUCCESS', // Add a default status if not provided
        result: payload.result || null, // Provide a default result
        error: payload.error, // Optional error
      },
      {
        userId: metadata.userId,
        timestamp: new Date(metadata.timestamp),
        correlationId: metadata.correlationId,
        causationId: metadata.causationId,
      },
    );

    await this.eventStore.append([event], agent.version);
    this.logger.info('Task completed by agent', { agentId, taskId: payload.taskId });
  }
}

// Factory function to create all agent command handlers
export function createAgentCommandHandlers(
  eventStore: EventStore,
  logger: Logger,
): Map<string, CommandHandler> {
  const handlers = new Map<string, CommandHandler>();

  handlers.set(AgentCommandTypes.CREATE_AGENT, new CreateAgentCommandHandler(eventStore, logger));
  handlers.set(AgentCommandTypes.UPDATE_AGENT, new UpdateAgentCommandHandler(eventStore, logger));
  handlers.set(AgentCommandTypes.ASSIGN_TASK, new AssignTaskCommandHandler(eventStore, logger));
  handlers.set(AgentCommandTypes.COMPLETE_TASK, new CompleteTaskCommandHandler(eventStore, logger));

  return handlers;
}

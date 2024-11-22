import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AgentBaseService } from '../base/AgentBaseService.js';
import { CollaborationSession } from '../../shared/database/entities/CollaborationSession.js';
import { KnowledgeTransfer } from '../../shared/database/entities/KnowledgeTransfer.js';
import { AgentEventType } from '../../shared/events/EventTypes.js';
import { MetricsService } from '../../shared/metrics/MetricsService.js';
import { QueueService } from '../../shared/queue/QueueService.js';
import { KnowledgeService } from '../../shared/ai/KnowledgeService.js';
import { NotificationService } from '../../shared/notification/NotificationService.js';
import { EventBus } from '../../shared/events/EventBus.js';
import { Event } from '../../shared/events/Event.js';
import { Logger } from 'winston';
import logger from '../../../utils/logger.js';

export interface KnowledgeSharedEvent {
  sessionId: string;
  sourceAgentId: string;
  targetAgentId: string;
  knowledge: any;
}

@Service()
export class CollaborationService extends AgentBaseService<CollaborationSession> {
  private static instance: CollaborationService;
  protected readonly logger: Logger = logger;

  public static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      const repository = Container.get<Repository<CollaborationSession>>('typeorm.repository.CollaborationSession');
      CollaborationService.instance = new CollaborationService(
        repository,
        metricsService,
        queueService,
        knowledgeService,
        notificationService,
        EventBus.getInstance(),
      );
    }
    return CollaborationService.instance;
  }

  private constructor(
    repository: Repository<CollaborationSession>,
    metrics: MetricsService,
    queue: QueueService,
    private readonly knowledgeService: KnowledgeService,
    private readonly notificationService: NotificationService,
    eventBus: EventBus,
  ) {
    super(repository, 'CollaborationSession', 'collaboration', metrics, queue, eventBus);
  }

  protected async setupEventHandlers(): Promise<void> {
    await super.setupEventHandlers();
    this.eventBus.subscribe(AgentEventType.KNOWLEDGE_SHARED, async (event: Event<KnowledgeSharedEvent>) => {
      await this.handleKnowledgeShared(event.payload);
    });
  }

  async createSession(agentIds: string[]): Promise<CollaborationSession> {
    if (agentIds.length < 2) {
      throw new Error('A collaboration session requires at least 2 agents');
    }

    const session = await this.create({
      agents: agentIds,
      status: 'active',
      startTime: new Date(),
      metadata: {},
    });

    await this.publishEvent(AgentEventType.COLLABORATION_STARTED, {
      sessionId: session.id,
      agentIds,
    });

    await this.notificationService.notify({
      userId: 'system',
      title: 'Collaboration Session Started',
      message: `A new collaboration session has started with ${agentIds.length} agents`,
      priority: 'low',
    });

    return session;
  }

  async endSession(sessionId: string): Promise<void> {
    const session = await this.findById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    await this.update(sessionId, {
      status: 'completed',
      endTime: new Date(),
    });

    await this.publishEvent(AgentEventType.COLLABORATION_ENDED, {
      sessionId,
      agentIds: session.agents,
    });

    await this.notificationService.notify({
      userId: 'system',
      title: 'Collaboration Session Ended',
      message: `Collaboration session ${sessionId} has ended`,
      priority: 'low',
    });
  }

  async shareKnowledge(
    sessionId: string,
    sourceAgentId: string,
    targetAgentId: string,
    knowledge: any,
  ): Promise<KnowledgeTransfer> {
    const session = await this.findById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (!session.agents.includes(sourceAgentId) || !session.agents.includes(targetAgentId)) {
      throw new Error('Both agents must be part of the collaboration session');
    }

    const transfer = await this.repository.manager.getRepository(KnowledgeTransfer).save({
      session: sessionId,
      sourceAgent: sourceAgentId,
      targetAgent: targetAgentId,
      knowledge,
      status: 'completed',
      timestamp: new Date(),
    });

    await this.publishEvent(AgentEventType.KNOWLEDGE_SHARED, {
      sessionId,
      sourceAgentId,
      targetAgentId,
      knowledge,
    });

    return transfer;
  }

  private async handleKnowledgeShared(event: KnowledgeSharedEvent): Promise<void> {
    const { sessionId, sourceAgentId, targetAgentId } = event;
    await this.notificationService.notify({
      userId: 'system',
      title: 'Knowledge Shared',
      message: `Agent ${sourceAgentId} shared knowledge with agent ${targetAgentId} in session ${sessionId}`,
      priority: 'low',
    });
  }

  async getSessionParticipants(sessionId: string): Promise<string[]> {
    const session = await this.findById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    return session.agents;
  }

  async getSessionHistory(sessionId: string): Promise<KnowledgeTransfer[]> {
    const session = await this.findById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    return this.repository.manager
      .getRepository(KnowledgeTransfer)
      .find({ where: { session: sessionId } });
  }
}

export const collaborationService = CollaborationService.getInstance();

import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AgentBaseService } from '../base/AgentBaseService.js';
import { Team } from '../../shared/database/entities/Team.js';
import { AgentEventType } from '../../shared/events/EventTypes.js';
import { MetricsService } from '../../shared/metrics/MetricsService.js';
import { QueueService } from '../../shared/queue/QueueService.js';
import { KnowledgeService } from '../../shared/ai/KnowledgeService.js';
import { NotificationService } from '../../shared/notification/NotificationService.js';
import { EventBus } from '../../shared/events/EventBus.js';
import { Logger } from 'winston';
import logger from '../../../utils/logger.js';

interface AgentTeam extends Team {
  ownerId: string;
  roles: Role[];
}

@Service()
export class AgentManagerService extends AgentBaseService<Team> {
  private static instance: AgentManagerService;
  protected readonly logger: Logger = logger;

  public static getInstance(): AgentManagerService {
    if (!AgentManagerService.instance) {
      const repository = Container.get<Repository<Team>>('typeorm.repository.Team');
      AgentManagerService.instance = new AgentManagerService(
        repository,
        metricsService,
        queueService,
        knowledgeService,
        notificationService,
        EventBus.getInstance()
      );
    }
    return AgentManagerService.instance;
  }

  private constructor(
    repository: Repository<Team>,
    metrics: MetricsService,
    queue: QueueService,
    private readonly knowledgeService: KnowledgeService,
    private readonly notificationService: NotificationService,
    eventBus: EventBus
  ) {
    super(repository, 'Team', 'agent_manager', metrics, queue, eventBus);
  }

  protected async setupEventHandlers(): Promise<void> {
    await super.setupEventHandlers();
    this.eventBus.subscribe<AgentEventPayload>(
      AgentEventType.AGENT_CREATED,
      async event => await this.handleAgentCreated(event)
    );
  }

  async createTeam(ownerId: string, name: string, roles: Role[]): Promise<Team> {
    const team = await this.create({
      ownerId,
      name,
      roles,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AgentTeam);

    await this.publishEvent(AgentEventType.TEAM_CREATED, {
      teamId: team.id,
      ownerId: team.ownerId,
    });

    return team;
  }

  async addAgentToTeam(teamId: string, agentId: string): Promise<void> {
    const team = await this.findById(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    const agent = await this.repository.manager
      .getRepository('Agent')
      .findOne({ where: { id: agentId } });

    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    await this.publishEvent(AgentEventType.AGENT_ADDED_TO_TEAM, {
      teamId,
      agentId,
    });

    await this.notificationService.notify({
      userId: team.ownerId,
      title: 'Agent Added to Team',
      message: `Agent ${agent.name} has been added to team ${team.name}`,
      priority: 'low',
    });
  }

  async removeAgentFromTeam(teamId: string, agentId: string): Promise<void> {
    const team = await this.findById(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    const agent = await this.repository.manager
      .getRepository('Agent')
      .findOne({ where: { id: agentId } });

    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    await this.publishEvent(AgentEventType.AGENT_REMOVED_FROM_TEAM, {
      teamId,
      agentId,
    });

    await this.notificationService.notify({
      userId: team.ownerId,
      title: 'Agent Removed from Team',
      message: `Agent ${agent.name} has been removed from team ${team.name}`,
      priority: 'low',
    });
  }

  private async handleAgentCreated(event: Event<AgentEventPayload>): Promise<void> {
    const { agentId } = event.payload;
    await this.knowledgeService.initializeAgentKnowledge(agentId);
  }

  async findAvailableAgents(requirements: string[]): Promise<string[]> {
    // Implementation to find available agents based on requirements
    return [];
  }
}

export const agentManagerService = AgentManagerService.getInstance();

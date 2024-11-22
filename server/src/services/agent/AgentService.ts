import { Repository } from 'typeorm';
import { Agent } from './entities/Agent.js';
import { AgentBaseService } from './base/AgentBaseService.js';
import { MetricsService } from '../shared/metrics/MetricsService.js';
import { QueueService } from '../shared/queue/QueueService.js';
import { EventBus } from '../shared/events/EventBus.js';
import { AgentStatus } from './types/AgentStatus.js';
import { AgentRole } from './types/AgentRole.js';
import { AgentCapability } from './types/AgentCapability.js';

export class AgentService extends AgentBaseService<Agent> {
  constructor(
    repository: Repository<Agent>,
    metrics: MetricsService,
    queue: QueueService,
    eventBus: EventBus,
  ) {
    super(repository, 'Agent', 'AgentService', metrics, queue, eventBus);
  }

  async createAgent(
    name: string,
    role: AgentRole,
    capabilities: AgentCapability[],
  ): Promise<Agent> {
    const agent = new Agent();
    agent.name = name;
    agent.role = role;
    agent.capabilities = capabilities;
    agent.status = AgentStatus.AVAILABLE;

    try {
      const savedAgent = await this.repository.save(agent);
      await this.publishEvent('agent.created', savedAgent);
      return savedAgent;
    } catch (error) {
      await this.handleError(error as Error, 'createAgent');
      throw error;
    }
  }

  async updateAgentStatus(agentId: string, status: AgentStatus): Promise<Agent> {
    try {
      const agent = await this.repository.findOne({ where: { id: agentId } });
      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }

      agent.status = status;
      const updatedAgent = await this.repository.save(agent);
      await this.publishEvent('agent.status_updated', updatedAgent);
      return updatedAgent;
    } catch (error) {
      await this.handleError(error as Error, 'updateAgentStatus');
      throw error;
    }
  }

  async assignCapabilities(
    agentId: string,
    capabilities: AgentCapability[],
  ): Promise<Agent> {
    try {
      const agent = await this.repository.findOne({ where: { id: agentId } });
      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }

      agent.capabilities = capabilities;
      const updatedAgent = await this.repository.save(agent);
      await this.publishEvent('agent.capabilities_updated', updatedAgent);
      return updatedAgent;
    } catch (error) {
      await this.handleError(error as Error, 'assignCapabilities');
      throw error;
    }
  }

  async findAvailableAgents(role?: AgentRole): Promise<Agent[]> {
    try {
      const query = this.repository
        .createQueryBuilder('agent')
        .where('agent.status = :status', { status: AgentStatus.AVAILABLE });

      if (role) {
        query.andWhere('agent.role = :role', { role });
      }

      return await query.getMany();
    } catch (error) {
      await this.handleError(error as Error, 'findAvailableAgents');
      throw error;
    }
  }

  async findAgentsByCapability(capability: AgentCapability): Promise<Agent[]> {
    try {
      return await this.repository
        .createQueryBuilder('agent')
        .where(':capability = ANY(agent.capabilities)', { capability })
        .getMany();
    } catch (error) {
      await this.handleError(error as Error, 'findAgentsByCapability');
      throw error;
    }
  }

  protected async setupEventHandlers(): Promise<void> {
    await this.eventBus.subscribe('agent.status_request', async (event) => {
      await this.handleEvent(event, async (e) => {
        const { agentId, status } = e.payload as {
          agentId: string;
          status: AgentStatus;
        };
        await this.updateAgentStatus(agentId, status);
      });
    });
  }
}

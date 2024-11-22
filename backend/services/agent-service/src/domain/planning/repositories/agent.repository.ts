import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Agent } from '../entities/agent.entity';
import { CreateAgentDto } from '../dto/create-agent.dto';
import { AgentRole, AgentStatus } from '@coworker/shared';

@Injectable()
export class AgentRepository extends Repository<Agent> {
  constructor(private dataSource: DataSource) {
    super(Agent, dataSource.createEntityManager());
  }

  async createAgent(createAgentDto: CreateAgentDto): Promise<Agent> {
    const agent = new Agent();
    agent.name = createAgentDto.name;
    agent.description = createAgentDto.description;
    agent.status = AgentStatus.IDLE;
    agent.role = createAgentDto.role;
    agent.capabilities = createAgentDto.capabilities;
    agent.performance_metrics = createAgentDto.performance_metrics;
    agent.learning_model = createAgentDto.learning_model;
    agent.working_memory = createAgentDto.working_memory;
    agent.communication = createAgentDto.communication;
    agent.metadata = createAgentDto.metadata;

    return this.save(agent);
  }

  async findAll(): Promise<Agent[]> {
    return this.find();
  }

  async findById(id: string): Promise<Agent | null> {
    return this.findOne({ where: { id } });
  }

  async findByRole(role: AgentRole): Promise<Agent[]> {
    return this.find({ where: { role } });
  }

  async findByStatus(status: AgentStatus): Promise<Agent[]> {
    return this.find({ where: { status } });
  }
}

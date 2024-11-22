import { Injectable } from '@nestjs/common';
import { AgentRepository } from '../database/repositories/AgentRepository';
import { Agent } from '../database/entities/Agent';
import { AgentRole, AgentStatus } from '../types/agent';
import { EventStore } from '../events/store/EventStore';

@Injectable()
export class AgentService {
    constructor(
        private readonly agentRepository: AgentRepository,
        private readonly eventStore: EventStore
    ) {}

    async createAgent(agentData: Partial<Agent>): Promise<Agent> {
        const agent = new Agent();
        Object.assign(agent, agentData);
        
        return this.agentRepository.withTransaction(async () => {
            const savedAgent = await this.agentRepository.save(agent);
            return savedAgent;
        });
    }

    async updateAgent(id: string, agentData: Partial<Agent>): Promise<Agent> {
        const agent = await this.agentRepository.findById(id);
        if (!agent) {
            throw new Error(`Agent with id ${id} not found`);
        }

        Object.assign(agent, agentData);
        
        return this.agentRepository.withTransaction(async () => {
            const updatedAgent = await this.agentRepository.save(agent);
            return updatedAgent;
        });
    }

    async assignToProject(agentId: string, projectId: string): Promise<Agent> {
        const agent = await this.agentRepository.findById(agentId);
        if (!agent) {
            throw new Error(`Agent with id ${agentId} not found`);
        }

        return this.agentRepository.withTransaction(async () => {
            agent.addToProject(projectId);
            return this.agentRepository.save(agent);
        });
    }

    async assignToTeam(agentId: string, teamId: string): Promise<Agent> {
        const agent = await this.agentRepository.findById(agentId);
        if (!agent) {
            throw new Error(`Agent with id ${agentId} not found`);
        }

        return this.agentRepository.withTransaction(async () => {
            agent.addToTeam(teamId);
            return this.agentRepository.save(agent);
        });
    }

    async updateStatus(agentId: string, status: AgentStatus): Promise<Agent> {
        const agent = await this.agentRepository.findById(agentId);
        if (!agent) {
            throw new Error(`Agent with id ${agentId} not found`);
        }

        return this.agentRepository.withTransaction(async () => {
            agent.updateStatus(status);
            return this.agentRepository.save(agent);
        });
    }

    async findAvailableAgents(): Promise<Agent[]> {
        return this.agentRepository.findByStatus(AgentStatus.IDLE);
    }

    async findAgentsByCapabilities(capabilities: string[]): Promise<Agent[]> {
        return this.agentRepository.findByCapabilities(capabilities);
    }

    async findAgentsByRole(role: AgentRole): Promise<Agent[]> {
        return this.agentRepository.findByRole(role);
    }

    async getAgentHistory(agentId: string): Promise<any[]> {
        return this.eventStore.getEvents(agentId);
    }
}

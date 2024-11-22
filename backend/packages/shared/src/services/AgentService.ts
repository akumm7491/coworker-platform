import { Agent, AgentRole, AgentStatus } from '../types/agent/index.js';

export interface IAgentService {
    createAgent(name: string, role: AgentRole): Promise<Agent>;
    getAgentById(id: string): Promise<Agent | null>;
    updateAgentStatus(id: string, status: AgentStatus): Promise<Agent>;
    listAgents(): Promise<Agent[]>;
    deleteAgent(id: string): Promise<void>;
}
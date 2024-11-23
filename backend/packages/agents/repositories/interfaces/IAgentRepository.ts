import { BaseRepository } from '../BaseRepository';
import { Agent } from '../../entities/Agent';
import { AgentStatus, AgentRole, AgentPerformance } from '@coworker/shared/src/types/agent';
import { QueryRunner } from 'typeorm';

export interface IAgentRepository extends BaseRepository<Agent> {
    // Status-based queries
    findByStatus(status: AgentStatus, queryRunner?: QueryRunner): Promise<Agent[]>;
    findByRole(role: AgentRole, queryRunner?: QueryRunner): Promise<Agent[]>;
    findAvailableAgents(queryRunner?: QueryRunner): Promise<Agent[]>;
    
    // Capability queries
    findByCapability(capability: string, queryRunner?: QueryRunner): Promise<Agent[]>;
    findByCapabilities(capabilities: string[], queryRunner?: QueryRunner): Promise<Agent[]>;
    
    // Team-related queries
    findByTeam(teamId: string, queryRunner?: QueryRunner): Promise<Agent[]>;
    findUnassignedAgents(queryRunner?: QueryRunner): Promise<Agent[]>;
    
    // Task-related queries
    findByTask(taskId: string, queryRunner?: QueryRunner): Promise<Agent[]>;
    findByProject(projectId: string, queryRunner?: QueryRunner): Promise<Agent[]>;
    
    // Performance queries
    getPerformanceMetrics(agentId: string, queryRunner?: QueryRunner): Promise<AgentPerformance>;
    getTopPerformers(limit: number, queryRunner?: QueryRunner): Promise<Agent[]>;
    
    // Assignment operations
    assignToTeam(agentId: string, teamId: string, queryRunner?: QueryRunner): Promise<void>;
    removeFromTeam(agentId: string, teamId: string, queryRunner?: QueryRunner): Promise<void>;
    assignToTask(agentId: string, taskId: string, queryRunner?: QueryRunner): Promise<void>;
    removeFromTask(agentId: string, taskId: string, queryRunner?: QueryRunner): Promise<void>;
    
    // Aggregations
    countByStatus(status: AgentStatus, queryRunner?: QueryRunner): Promise<number>;
    countByRole(role: AgentRole, queryRunner?: QueryRunner): Promise<number>;
    countByTeam(teamId: string, queryRunner?: QueryRunner): Promise<number>;
    
    // Learning and memory operations
    updateLearningModel(agentId: string, modelData: unknown, queryRunner?: QueryRunner): Promise<void>;
    updateWorkingMemory(agentId: string, memoryData: unknown, queryRunner?: QueryRunner): Promise<void>;
    
    // Communication operations
    updateCommunicationPreferences(
        agentId: string,
        preferences: Record<string, string>,
        queryRunner?: QueryRunner
    ): Promise<void>;
    addCommunicationHistory(
        agentId: string,
        historyEntry: {
            timestamp: string;
            type: string;
            content: string;
            metadata: Record<string, unknown>;
        },
        queryRunner?: QueryRunner
    ): Promise<void>;
}

import { BaseRepository } from '../BaseRepository';
import { Team } from '../../entities/Team';
import { TeamStatus } from '@coworker/shared/src/types/agent';
import { QueryRunner } from 'typeorm';

export interface ITeamRepository extends BaseRepository<Team> {
    // Status-based queries
    findByStatus(status: TeamStatus, queryRunner?: QueryRunner): Promise<Team[]>;
    findActiveTeams(queryRunner?: QueryRunner): Promise<Team[]>;
    
    // Member-related queries
    findByMemberId(agentId: string, queryRunner?: QueryRunner): Promise<Team[]>;
    findByCapability(capability: string, queryRunner?: QueryRunner): Promise<Team[]>;
    
    // Project-related queries
    findByProject(projectId: string, queryRunner?: QueryRunner): Promise<Team[]>;
    findUnassignedTeams(queryRunner?: QueryRunner): Promise<Team[]>;
    
    // Capability operations
    addCapability(
        teamId: string,
        capability: string,
        level: number,
        queryRunner?: QueryRunner
    ): Promise<void>;
    removeCapability(teamId: string, capability: string, queryRunner?: QueryRunner): Promise<void>;
    updateCapabilityLevel(
        teamId: string,
        capability: string,
        level: number,
        queryRunner?: QueryRunner
    ): Promise<void>;
    
    // Member operations
    addMember(teamId: string, agentId: string, queryRunner?: QueryRunner): Promise<void>;
    removeMember(teamId: string, agentId: string, queryRunner?: QueryRunner): Promise<void>;
    
    // Aggregations
    countByStatus(status: TeamStatus, queryRunner?: QueryRunner): Promise<number>;
    countByProject(projectId: string, queryRunner?: QueryRunner): Promise<number>;
    getTeamSize(teamId: string, queryRunner?: QueryRunner): Promise<number>;
    getTeamCapabilities(teamId: string, queryRunner?: QueryRunner): Promise<Record<string, number>>;
    
    // Analytics
    getTeamPerformance(teamId: string, queryRunner?: QueryRunner): Promise<{
        taskCompletion: number;
        avgResponseTime: number;
        successRate: number;
        collaborationScore: number;
    }>;
    getTeamWorkload(teamId: string, queryRunner?: QueryRunner): Promise<{
        activeTasks: number;
        completedTasks: number;
        upcomingTasks: number;
    }>;
}

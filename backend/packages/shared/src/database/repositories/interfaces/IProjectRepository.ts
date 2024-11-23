import { BaseRepository } from '../BaseRepository';
import { Project } from '../../entities/Project';
import {
    ProjectStatus,
    ProjectVision,
    ProjectIntegration,
    ProjectDesignSystem,
    ProjectFeature,
    ProjectAnalytics,
} from '../../../types/agent';
import { QueryRunner } from 'typeorm';

export interface IProjectRepository extends BaseRepository<Project> {
    // Status-based queries
    findByStatus(status: ProjectStatus, queryRunner?: QueryRunner): Promise<Project[]>;
    findActiveProjects(queryRunner?: QueryRunner): Promise<Project[]>;
    findCompletedProjects(queryRunner?: QueryRunner): Promise<Project[]>;
    
    // Team and agent queries
    findByTeam(teamId: string, queryRunner?: QueryRunner): Promise<Project[]>;
    findByAgent(agentId: string, queryRunner?: QueryRunner): Promise<Project[]>;
    findByLeadAgent(agentId: string, queryRunner?: QueryRunner): Promise<Project[]>;
    
    // Vision and requirements
    updateVision(
        projectId: string,
        vision: ProjectVision,
        queryRunner?: QueryRunner
    ): Promise<void>;
    updateRequirements(
        projectId: string,
        requirements: string[],
        queryRunner?: QueryRunner
    ): Promise<void>;
    
    // Integration operations
    addIntegration(
        projectId: string,
        key: string,
        integration: ProjectIntegration,
        queryRunner?: QueryRunner
    ): Promise<void>;
    removeIntegration(
        projectId: string,
        key: string,
        queryRunner?: QueryRunner
    ): Promise<void>;
    updateIntegration(
        projectId: string,
        key: string,
        integration: ProjectIntegration,
        queryRunner?: QueryRunner
    ): Promise<void>;
    
    // Design system operations
    updateDesignSystem(
        projectId: string,
        designSystem: ProjectDesignSystem,
        queryRunner?: QueryRunner
    ): Promise<void>;
    
    // Feature operations
    addFeature(
        projectId: string,
        key: string,
        feature: ProjectFeature,
        queryRunner?: QueryRunner
    ): Promise<void>;
    removeFeature(
        projectId: string,
        key: string,
        queryRunner?: QueryRunner
    ): Promise<void>;
    updateFeature(
        projectId: string,
        key: string,
        feature: ProjectFeature,
        queryRunner?: QueryRunner
    ): Promise<void>;
    
    // Team and agent operations
    assignTeam(projectId: string, teamId: string, queryRunner?: QueryRunner): Promise<void>;
    unassignTeam(projectId: string, teamId: string, queryRunner?: QueryRunner): Promise<void>;
    assignAgent(projectId: string, agentId: string, queryRunner?: QueryRunner): Promise<void>;
    unassignAgent(projectId: string, agentId: string, queryRunner?: QueryRunner): Promise<void>;
    setLeadAgent(projectId: string, agentId: string, queryRunner?: QueryRunner): Promise<void>;
    
    // Analytics operations
    updateAnalytics(
        projectId: string,
        analytics: ProjectAnalytics,
        queryRunner?: QueryRunner
    ): Promise<void>;
    
    // Aggregations
    countByStatus(status: ProjectStatus, queryRunner?: QueryRunner): Promise<number>;
    getTeamCount(projectId: string, queryRunner?: QueryRunner): Promise<number>;
    getAgentCount(projectId: string, queryRunner?: QueryRunner): Promise<number>;
    getTaskCount(projectId: string, queryRunner?: QueryRunner): Promise<number>;
    
    // Timeline operations
    updateStartDate(projectId: string, date: Date, queryRunner?: QueryRunner): Promise<void>;
    updateCompletionDate(projectId: string, date: Date, queryRunner?: QueryRunner): Promise<void>;
    updateDeadline(projectId: string, date: Date, queryRunner?: QueryRunner): Promise<void>;
    
    // Progress tracking
    getProgress(projectId: string, queryRunner?: QueryRunner): Promise<{
        completedTasks: number;
        totalTasks: number;
        progress: number;
        timeRemaining: number;
        estimatedCompletion: Date;
    }>;
    getResourceUtilization(projectId: string, queryRunner?: QueryRunner): Promise<{
        teamUtilization: number;
        agentUtilization: number;
        resourceAllocation: Record<string, number>;
    }>;
}

import { BaseRepository } from '../BaseRepository';
import { Task } from '../../entities/Task';
import {
    TaskStatus,
    TaskPriority,
    TaskType,
    TaskRequirements,
    TaskDependencies,
    TaskExecutionPlan,
    TaskValidationResult,
} from '../../../types/agent';
import { QueryRunner } from 'typeorm';

export interface ITaskRepository extends BaseRepository<Task> {
    // Status-based queries
    findByStatus(status: TaskStatus, queryRunner?: QueryRunner): Promise<Task[]>;
    findByPriority(priority: TaskPriority, queryRunner?: QueryRunner): Promise<Task[]>;
    findByType(type: TaskType, queryRunner?: QueryRunner): Promise<Task[]>;
    findPendingTasks(queryRunner?: QueryRunner): Promise<Task[]>;
    findBlockedTasks(queryRunner?: QueryRunner): Promise<Task[]>;
    
    // Assignment queries
    findByAssignedAgent(agentId: string, queryRunner?: QueryRunner): Promise<Task[]>;
    findByTeam(teamId: string, queryRunner?: QueryRunner): Promise<Task[]>;
    findUnassignedTasks(queryRunner?: QueryRunner): Promise<Task[]>;
    
    // Project-related queries
    findByProject(projectId: string, queryRunner?: QueryRunner): Promise<Task[]>;
    findByProjectAndStatus(
        projectId: string,
        status: TaskStatus,
        queryRunner?: QueryRunner
    ): Promise<Task[]>;
    
    // Dependency queries
    findDependentTasks(taskId: string, queryRunner?: QueryRunner): Promise<Task[]>;
    findBlockingTasks(taskId: string, queryRunner?: QueryRunner): Promise<Task[]>;
    
    // Requirements and validation
    updateRequirements(
        taskId: string,
        requirements: TaskRequirements,
        queryRunner?: QueryRunner
    ): Promise<void>;
    updateDependencies(
        taskId: string,
        dependencies: TaskDependencies,
        queryRunner?: QueryRunner
    ): Promise<void>;
    addValidationResult(
        taskId: string,
        result: TaskValidationResult,
        queryRunner?: QueryRunner
    ): Promise<void>;
    
    // Execution plan
    updateExecutionPlan(
        taskId: string,
        plan: TaskExecutionPlan,
        queryRunner?: QueryRunner
    ): Promise<void>;
    updateProgress(taskId: string, progress: number, queryRunner?: QueryRunner): Promise<void>;
    
    // Assignment operations
    assignToAgent(taskId: string, agentId: string, queryRunner?: QueryRunner): Promise<void>;
    unassignFromAgent(taskId: string, agentId: string, queryRunner?: QueryRunner): Promise<void>;
    
    // Aggregations
    countByStatus(status: TaskStatus, queryRunner?: QueryRunner): Promise<number>;
    countByPriority(priority: TaskPriority, queryRunner?: QueryRunner): Promise<number>;
    countByType(type: TaskType, queryRunner?: QueryRunner): Promise<number>;
    countByProject(projectId: string, queryRunner?: QueryRunner): Promise<number>;
    
    // Analytics
    getTaskMetrics(taskId: string, queryRunner?: QueryRunner): Promise<{
        codeQuality?: number;
        testCoverage?: number;
        performanceScore?: number;
        complexity?: number;
    }>;
    getProjectProgress(projectId: string, queryRunner?: QueryRunner): Promise<{
        completedTasks: number;
        totalTasks: number;
        progress: number;
    }>;
    getAverageCompletionTime(projectId: string, queryRunner?: QueryRunner): Promise<number>;
}

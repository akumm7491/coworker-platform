import { QueryRunner } from 'typeorm';
import { Result } from '../../common/Result';
import { Project } from '../entities/Project';
import { ProjectStatus, ProjectVision } from '../types/project.types';

export interface IProjectRepository {
  findById(id: string, queryRunner?: QueryRunner): Promise<Result<Project | null>>;
  findAll(queryRunner?: QueryRunner): Promise<Result<Project[]>>;
  save(project: Project, queryRunner?: QueryRunner): Promise<Result<Project>>;
  delete(id: string, queryRunner?: QueryRunner): Promise<Result<void>>;

  // Status-based queries
  findByStatus(status: ProjectStatus, queryRunner?: QueryRunner): Promise<Result<Project[]>>;
  findActiveProjects(queryRunner?: QueryRunner): Promise<Result<Project[]>>;
  findCompletedProjects(queryRunner?: QueryRunner): Promise<Result<Project[]>>;

  // Team and agent queries
  findByTeam(teamId: string, queryRunner?: QueryRunner): Promise<Result<Project[]>>;
  findByAgent(agentId: string, queryRunner?: QueryRunner): Promise<Result<Project[]>>;
  findByLeadAgent(agentId: string, queryRunner?: QueryRunner): Promise<Result<Project[]>>;

  // Vision and requirements
  updateVision(
    projectId: string,
    vision: ProjectVision,
    queryRunner?: QueryRunner
  ): Promise<Result<void>>;

  // Transaction support
  withTransaction<T>(
    operation: (queryRunner: QueryRunner) => Promise<Result<T>>
  ): Promise<Result<T>>;
}

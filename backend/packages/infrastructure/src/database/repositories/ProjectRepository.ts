import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { Project } from '@coworker/shared-kernel/domain/entities/Project';
import { IProjectRepository } from '@coworker/shared-kernel/domain/repositories/IProjectRepository';
import { 
  ProjectStatus, 
  ProjectVision, 
  ProjectAnalytics, 
  ProjectIntegration, 
  ProjectDesignSystem, 
  ProjectFeature 
} from '@coworker/shared-kernel/domain/types/project.types';
import { Result } from '@coworker/shared-kernel/domain/Result';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>
  ) {}

  private getRepo(queryRunner?: QueryRunner): Repository<Project> {
    return queryRunner ? queryRunner.manager.getRepository(Project) : this.repository;
  }

  private async findProjectById(id: string, queryRunner?: QueryRunner): Promise<Result<Project>> {
    const project = await this.getRepo(queryRunner).findOne({ where: { id } });
    return project ? Result.ok(project) : Result.fail('Project not found');
  }

  async findByStatus(status: ProjectStatus, queryRunner?: QueryRunner): Promise<Project[]> {
    return this.getRepo(queryRunner).find({ where: { status } });
  }

  async findActiveProjects(queryRunner?: QueryRunner): Promise<Project[]> {
    return this.getRepo(queryRunner).find({
      where: [
        { status: ProjectStatus.IN_PROGRESS },
        { status: ProjectStatus.PLANNING }
      ]
    });
  }

  async findCompletedProjects(queryRunner?: QueryRunner): Promise<Project[]> {
    return this.getRepo(queryRunner).find({ where: { status: ProjectStatus.COMPLETED } });
  }

  async findByTeam(teamId: string, queryRunner?: QueryRunner): Promise<Project[]> {
    return this.getRepo(queryRunner)
      .createQueryBuilder('project')
      .innerJoin('project.teams', 'team')
      .where('team.id = :teamId', { teamId })
      .getMany();
  }

  async findByAgent(agentId: string, queryRunner?: QueryRunner): Promise<Project[]> {
    return this.getRepo(queryRunner)
      .createQueryBuilder('project')
      .innerJoin('project.agents', 'agent')
      .where('agent.id = :agentId', { agentId })
      .getMany();
  }

  async findByLeadAgent(agentId: string, queryRunner?: QueryRunner): Promise<Project[]> {
    return this.getRepo(queryRunner).find({ where: { leadAgent: { id: agentId } } });
  }

  async updateVision(
    projectId: string,
    vision: ProjectVision,
    queryRunner?: QueryRunner
  ): Promise<Result<void>> {
    const projectResult = await this.findProjectById(projectId, queryRunner);
    if (projectResult.isFailure) return Result.fail(projectResult.error);

    const project = projectResult.getValue();
    const result = project.updateVision(vision);
    if (result.isFailure) return Result.fail(result.error);

    await this.getRepo(queryRunner).save(project);
    return Result.ok();
  }

  async updateRequirements(
    projectId: string,
    requirements: string[],
    queryRunner?: QueryRunner
  ): Promise<Result<void>> {
    const projectResult = await this.findProjectById(projectId, queryRunner);
    if (projectResult.isFailure) return Result.fail(projectResult.error);

    const project = projectResult.getValue();
    project.requirements = requirements;
    await this.getRepo(queryRunner).save(project);
    return Result.ok();
  }

  async addIntegration(
    projectId: string,
    key: string,
    integration: ProjectIntegration,
    queryRunner?: QueryRunner
  ): Promise<Result<void>> {
    const projectResult = await this.findProjectById(projectId, queryRunner);
    if (projectResult.isFailure) return Result.fail(projectResult.error);

    const project = projectResult.getValue();
    const result = project.addIntegration(key, integration);
    if (result.isFailure) return Result.fail(result.error);

    await this.getRepo(queryRunner).save(project);
    return Result.ok();
  }

  async removeIntegration(
    projectId: string,
    key: string,
    queryRunner?: QueryRunner
  ): Promise<Result<void>> {
    const projectResult = await this.findProjectById(projectId, queryRunner);
    if (projectResult.isFailure) return Result.fail(projectResult.error);

    const project = projectResult.getValue();
    const result = project.removeIntegration(key);
    if (result.isFailure) return Result.fail(result.error);

    await this.getRepo(queryRunner).save(project);
    return Result.ok();
  }

  async updateDesignSystem(
    projectId: string,
    designSystem: ProjectDesignSystem,
    queryRunner?: QueryRunner
  ): Promise<Result<void>> {
    const projectResult = await this.findProjectById(projectId, queryRunner);
    if (projectResult.isFailure) return Result.fail(projectResult.error);

    const project = projectResult.getValue();
    project.designSystem = designSystem;
    await this.getRepo(queryRunner).save(project);
    return Result.ok();
  }

  async addFeature(
    projectId: string,
    key: string,
    feature: ProjectFeature,
    queryRunner?: QueryRunner
  ): Promise<Result<void>> {
    const projectResult = await this.findProjectById(projectId, queryRunner);
    if (projectResult.isFailure) return Result.fail(projectResult.error);

    const project = projectResult.getValue();
    const result = project.addFeature(key, feature);
    if (result.isFailure) return Result.fail(result.error);

    await this.getRepo(queryRunner).save(project);
    return Result.ok();
  }

  async removeFeature(
    projectId: string,
    key: string,
    queryRunner?: QueryRunner
  ): Promise<Result<void>> {
    const projectResult = await this.findProjectById(projectId, queryRunner);
    if (projectResult.isFailure) return Result.fail(projectResult.error);

    const project = projectResult.getValue();
    const result = project.removeFeature(key);
    if (result.isFailure) return Result.fail(result.error);

    await this.getRepo(queryRunner).save(project);
    return Result.ok();
  }

  async updateAnalytics(
    projectId: string,
    analytics: ProjectAnalytics,
    queryRunner?: QueryRunner
  ): Promise<Result<void>> {
    const projectResult = await this.findProjectById(projectId, queryRunner);
    if (projectResult.isFailure) return Result.fail(projectResult.error);

    const project = projectResult.getValue();
    const result = project.updateAnalytics(analytics);
    if (result.isFailure) return Result.fail(result.error);

    await this.getRepo(queryRunner).save(project);
    return Result.ok();
  }

  async countByStatus(status: ProjectStatus, queryRunner?: QueryRunner): Promise<number> {
    return this.getRepo(queryRunner).count({ where: { status } });
  }

  async getTeamCount(projectId: string, queryRunner?: QueryRunner): Promise<number> {
    const project = await this.getRepo(queryRunner).findOne({
      where: { id: projectId },
      relations: ['teams']
    });
    return project?.teams?.length || 0;
  }

  async getAgentCount(projectId: string, queryRunner?: QueryRunner): Promise<number> {
    const project = await this.getRepo(queryRunner).findOne({
      where: { id: projectId },
      relations: ['agents']
    });
    return project?.agents?.length || 0;
  }

  async getTaskCount(projectId: string, queryRunner?: QueryRunner): Promise<number> {
    const project = await this.getRepo(queryRunner).findOne({
      where: { id: projectId },
      relations: ['tasks']
    });
    return project?.tasks?.length || 0;
  }

  async getProgress(projectId: string, queryRunner?: QueryRunner): Promise<{
    completedTasks: number;
    totalTasks: number;
    progress: number;
    timeRemaining: number;
    estimatedCompletion: Date;
  }> {
    const project = await this.getRepo(queryRunner).findOne({
      where: { id: projectId },
      relations: ['tasks']
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate estimated completion based on current progress
    const now = new Date();
    const startDate = project.startDate || now;
    const elapsedTime = now.getTime() - startDate.getTime();
    const timePerTask = completedTasks > 0 ? elapsedTime / completedTasks : 0;
    const remainingTasks = totalTasks - completedTasks;
    const timeRemaining = timePerTask * remainingTasks;
    const estimatedCompletion = new Date(now.getTime() + timeRemaining);

    return {
      completedTasks,
      totalTasks,
      progress,
      timeRemaining,
      estimatedCompletion
    };
  }

  async getResourceUtilization(projectId: string, queryRunner?: QueryRunner): Promise<{
    teamUtilization: number;
    agentUtilization: number;
    resourceAllocation: Record<string, number>;
  }> {
    const project = await this.getRepo(queryRunner).findOne({
      where: { id: projectId },
      relations: ['teams', 'agents', 'tasks']
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const totalTeams = project.teams.length;
    const activeTeams = project.teams.filter(t => t.members.length > 0).length;
    const teamUtilization = totalTeams > 0 ? (activeTeams / totalTeams) * 100 : 0;

    const totalAgents = project.agents.length;
    const activeAgents = project.tasks.filter(t => t.status === 'in_progress').length;
    const agentUtilization = totalAgents > 0 ? (activeAgents / totalAgents) * 100 : 0;

    const resourceAllocation: Record<string, number> = {};
    project.teams.forEach(team => {
      resourceAllocation[team.id] = team.members.length;
    });

    return {
      teamUtilization,
      agentUtilization,
      resourceAllocation
    };
  }
}

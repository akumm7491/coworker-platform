import { QueryRunner } from 'typeorm';
import { Team } from '../entities/Team';
import { TeamStatus, TeamCapability } from '../types/team.types';
import { Result } from '../Result';

export interface ITeamRepository {
  // Basic CRUD
  findById(id: string, queryRunner?: QueryRunner): Promise<Result<Team>>;
  findAll(queryRunner?: QueryRunner): Promise<Result<Team[]>>;
  save(team: Team, queryRunner?: QueryRunner): Promise<Result<void>>;
  delete(id: string, queryRunner?: QueryRunner): Promise<Result<void>>;

  // Status-based queries
  findByStatus(status: TeamStatus, queryRunner?: QueryRunner): Promise<Result<Team[]>>;
  findActiveTeams(queryRunner?: QueryRunner): Promise<Result<Team[]>>;
  findInactiveTeams(queryRunner?: QueryRunner): Promise<Result<Team[]>>;

  // Member management
  findByMember(memberId: string, queryRunner?: QueryRunner): Promise<Result<Team[]>>;
  findByLeader(leaderId: string, queryRunner?: QueryRunner): Promise<Result<Team[]>>;
  getTeamMembers(teamId: string, queryRunner?: QueryRunner): Promise<Result<string[]>>;

  // Capability queries
  findByCapability(capability: TeamCapability, queryRunner?: QueryRunner): Promise<Result<Team[]>>;
  getTeamCapabilities(teamId: string, queryRunner?: QueryRunner): Promise<Result<TeamCapability[]>>;
  findTeamsWithAllCapabilities(
    capabilities: TeamCapability[],
    queryRunner?: QueryRunner
  ): Promise<Result<Team[]>>;
  findTeamsWithAnyCapability(
    capabilities: TeamCapability[],
    queryRunner?: QueryRunner
  ): Promise<Result<Team[]>>;

  // Performance and metrics
  getTeamMetrics(
    teamId: string,
    queryRunner?: QueryRunner
  ): Promise<
    Result<{
      task_completion_rate: number;
      avg_task_completion_time: number;
      code_quality_score: number;
      collaboration_score: number;
      productivity_score: number;
    }>
  >;

  // Workload management
  getTeamWorkload(
    teamId: string,
    queryRunner?: QueryRunner
  ): Promise<
    Result<{
      current_tasks: number;
      completed_tasks: number;
      pending_tasks: number;
      workload_percentage: number;
    }>
  >;

  // Schedule and availability
  getTeamSchedule(
    teamId: string,
    queryRunner?: QueryRunner
  ): Promise<
    Result<{
      working_hours: { start: Date; end: Date }[];
      time_zone: string;
      availability_percentage: number;
    }>
  >;

  // Project association
  findTeamsByProject(projectId: string, queryRunner?: QueryRunner): Promise<Result<Team[]>>;
  getTeamProjects(teamId: string, queryRunner?: QueryRunner): Promise<Result<string[]>>;
}

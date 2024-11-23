import { QueryRunner } from 'typeorm';
import { Agent } from '../entities/Agent';
import {
  AgentStatus,
  AgentRole,
  AgentSkill,
  AgentSpecialization,
  AgentPerformanceMetrics,
} from '../types/agent.types';
import { Result } from '../Result';

export interface IAgentRepository {
  // Basic CRUD
  findById(id: string, queryRunner?: QueryRunner): Promise<Result<Agent>>;
  findAll(queryRunner?: QueryRunner): Promise<Result<Agent[]>>;
  save(agent: Agent, queryRunner?: QueryRunner): Promise<Result<void>>;
  delete(id: string, queryRunner?: QueryRunner): Promise<Result<void>>;

  // Status-based queries
  findByStatus(status: AgentStatus, queryRunner?: QueryRunner): Promise<Result<Agent[]>>;
  findAvailableAgents(queryRunner?: QueryRunner): Promise<Result<Agent[]>>;
  findBusyAgents(queryRunner?: QueryRunner): Promise<Result<Agent[]>>;

  // Role management
  findByRole(role: AgentRole, queryRunner?: QueryRunner): Promise<Result<Agent[]>>;
  getAgentRoles(agentId: string, queryRunner?: QueryRunner): Promise<Result<AgentRole[]>>;
  findAgentsWithAllRoles(roles: AgentRole[], queryRunner?: QueryRunner): Promise<Result<Agent[]>>;

  // Performance tracking
  getAgentPerformance(
    agentId: string,
    queryRunner?: QueryRunner
  ): Promise<Result<AgentPerformanceMetrics>>;
  getTopPerformingAgents(limit: number, queryRunner?: QueryRunner): Promise<Result<Agent[]>>;
  getAgentProductivity(
    agentId: string,
    queryRunner?: QueryRunner
  ): Promise<
    Result<{
      tasks_completed: number;
      avg_completion_time: number;
      success_rate: number;
    }>
  >;

  // Learning and model management
  getAgentLearningModel(
    agentId: string,
    queryRunner?: QueryRunner
  ): Promise<
    Result<{
      model_version: string;
      last_updated: Date;
      training_status: string;
    }>
  >;
  getAgentWorkingMemory(
    agentId: string,
    queryRunner?: QueryRunner
  ): Promise<
    Result<{
      context_size: number;
      last_accessed: Date;
      memory_usage: number;
    }>
  >;

  // Communication patterns
  getAgentCommunicationStats(
    agentId: string,
    queryRunner?: QueryRunner
  ): Promise<
    Result<{
      messages_sent: number;
      messages_received: number;
      avg_response_time: number;
      collaboration_score: number;
    }>
  >;

  // Skills and specializations
  findBySkill(skill: AgentSkill, queryRunner?: QueryRunner): Promise<Result<Agent[]>>;
  findBySpecialization(
    specialization: AgentSpecialization,
    queryRunner?: QueryRunner
  ): Promise<Result<Agent[]>>;
  getAgentSkills(agentId: string, queryRunner?: QueryRunner): Promise<Result<AgentSkill[]>>;
  getAgentSpecializations(
    agentId: string,
    queryRunner?: QueryRunner
  ): Promise<Result<AgentSpecialization[]>>;

  // Availability and scheduling
  getAgentAvailability(
    agentId: string,
    queryRunner?: QueryRunner
  ): Promise<
    Result<{
      available_hours: { start: Date; end: Date }[];
      time_zone: string;
      next_available_slot: Date;
    }>
  >;

  // Task assignment
  findAgentsByTask(taskId: string, queryRunner?: QueryRunner): Promise<Result<Agent[]>>;
  getAgentTasks(agentId: string, queryRunner?: QueryRunner): Promise<Result<string[]>>;
  findBestAgentForTask(taskId: string, queryRunner?: QueryRunner): Promise<Result<Agent>>;

  // Team association
  findAgentsByTeam(teamId: string, queryRunner?: QueryRunner): Promise<Result<Agent[]>>;
  getAgentTeams(agentId: string, queryRunner?: QueryRunner): Promise<Result<string[]>>;
}

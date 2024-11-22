import { DomainEvent } from '../../events/definitions/DomainEvent';
import { Agent, AgentRole, AgentStatus, Task, TaskStatus, TaskPriority, TaskType, Project, ProjectStatus, Team, TeamStatus } from '../agent';

export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  findByIds(ids: string[]): Promise<T[]>;
  save(entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

export interface TransactionalRepository<T> extends Repository<T> {
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  withTransaction<R>(operation: () => Promise<R>): Promise<R>;
}

export interface EventSourcedRepository<T> extends TransactionalRepository<T> {
  getEvents(id: string): Promise<DomainEvent[]>;
  saveEvents(id: string, events: DomainEvent[]): Promise<void>;
  replay(id: string): Promise<T>;
}

export interface QueryableRepository<T> extends Repository<T> {
  query(criteria: Record<string, unknown>): Promise<T[]>;
  count(criteria: Record<string, unknown>): Promise<number>;
  paginate(page: number, limit: number, criteria?: Record<string, unknown>): Promise<{
    items: T[];
    total: number;
    page: number;
    pages: number;
  }>;
}

export interface AgentRepository extends EventSourcedRepository<Agent>, QueryableRepository<Agent> {
  findByCapabilities(capabilities: string[]): Promise<Agent[]>;
  findByRole(role: AgentRole): Promise<Agent[]>;
  findByStatus(status: AgentStatus): Promise<Agent[]>;
  findByProject(projectId: string): Promise<Agent[]>;
  findByTeam(teamId: string): Promise<Agent[]>;
}

export interface TaskRepository extends EventSourcedRepository<Task>, QueryableRepository<Task> {
  findByStatus(status: TaskStatus): Promise<Task[]>;
  findByPriority(priority: TaskPriority): Promise<Task[]>;
  findByType(type: TaskType): Promise<Task[]>;
  findByProject(projectId: string): Promise<Task[]>;
  findByAssignedAgent(agentId: string): Promise<Task[]>;
  findByDependency(taskId: string): Promise<Task[]>;
}

export interface ProjectRepository extends EventSourcedRepository<Project>, QueryableRepository<Project> {
  findByStatus(status: ProjectStatus): Promise<Project[]>;
  findByLeadAgent(agentId: string): Promise<Project[]>;
  findByAssignedAgent(agentId: string): Promise<Project[]>;
  findByIntegration(integration: string): Promise<Project[]>;
}

export interface TeamRepository extends EventSourcedRepository<Team>, QueryableRepository<Team> {
  findByMember(agentId: string): Promise<Team[]>;
  findByCapability(capability: string): Promise<Team[]>;
  findByStatus(status: TeamStatus): Promise<Team[]>;
}

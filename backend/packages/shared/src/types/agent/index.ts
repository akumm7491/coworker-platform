import { BaseEntity } from '../common';

export enum AgentType {
  DEVELOPER = 'developer',
  ASSISTANT = 'assistant',
  SPECIALIST = 'specialist'
}

export enum AgentStatus {
  IDLE = 'idle',
  BUSY = 'busy',
  OFFLINE = 'offline'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ProjectStatus {
  PLANNING = 'planning',
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold'
}

export enum AgentRole {
  LEAD = 'lead',
  WORKER = 'worker',
  REVIEWER = 'reviewer',
  COORDINATOR = 'coordinator'
}

export enum TaskType {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  REVIEW = 'review',
  PLANNING = 'planning',
  DEPLOYMENT = 'deployment',
  MONITORING = 'monitoring',
  MAINTENANCE = 'maintenance'
}

export enum TeamStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface AgentPerformance {
  tasks_completed: number;
  avg_completion_time: number;
  success_rate: number;
  quality_score: number;
  collaboration_score: number;
}

export interface AgentLearningModel {
  model_type: string;
  parameters: Record<string, unknown>;
  training_data: Array<{
    input: unknown;
    output: unknown;
    feedback: unknown;
  }>;
  version: string;
}

export interface AgentWorkingMemory {
  context: Record<string, unknown>;
  short_term: Array<{
    timestamp: string;
    type: string;
    data: unknown;
  }>;
  long_term: Array<{
    category: string;
    knowledge: unknown;
    last_accessed: string;
  }>;
}

export interface AgentCommunication {
  style: string;
  preferences: Record<string, string>;
  history: Array<{
    timestamp: string;
    type: string;
    content: string;
    metadata: Record<string, unknown>;
  }>;
}

export interface Agent extends BaseEntity {
  name: string;
  description: string;
  status: AgentStatus;
  role: AgentRole;
  capabilities: string[];
  performance_metrics: AgentPerformance;
  learning_model: AgentLearningModel;
  working_memory: AgentWorkingMemory;
  communication: AgentCommunication;
  metadata?: Record<string, unknown>;
}

export interface Team extends BaseEntity {
  name: string;
  description: string;
  status: TeamStatus;
  members: Agent[];
  metadata?: Record<string, unknown>;
  capabilities: {
    [key: string]: number;
  };
}

export interface TaskRequirements {
  functional: string[];
  technical: string[];
  acceptance_criteria: string[];
}

export interface TaskDependencies {
  tasks: string[];
  resources: string[];
  external: string[];
}

export interface TaskExecutionPlan {
  steps: Array<{
    order: number;
    description: string;
    status: TaskStatus;
    agent_id?: string;
  }>;
  estimated_duration: number;
  actual_duration?: number;
}

export interface TaskValidationResult {
  timestamp: string;
  type: string;
  status: 'pass' | 'fail';
  details: Record<string, unknown>;
}

export interface TaskMetrics {
  code_quality?: number;
  test_coverage?: number;
  performance_score?: number;
  complexity?: number;
  [key: string]: number | undefined;
}

export interface Task extends BaseEntity {
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  progress: number;
  requirements: TaskRequirements;
  dependencies: TaskDependencies;
  execution_plan: TaskExecutionPlan;
  validation_results: TaskValidationResult[];
  metrics: TaskMetrics;
  metadata?: Record<string, unknown>;
  tags: string[];
}

export interface ProjectVision {
  goals: string[];
  constraints: string[];
  success_criteria: string[];
}

export interface ProjectIntegration {
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface ProjectDesignSystem {
  theme: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  typography: {
    fonts: Record<string, string>;
    sizes: Record<string, string>;
  };
  spacing: Record<string, string>;
  radius: Record<string, string>;
  icons: Record<string, string>;
}

export interface ProjectFeature {
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface ProjectAnalytics {
  agent_performance: Record<string, unknown>;
  task_completion: Record<string, unknown>;
  timeline: Array<{
    timestamp: string;
    event: string;
    details: Record<string, unknown>;
  }>;
  metrics: Record<string, number>;
}

export interface Project extends BaseEntity {
  name: string;
  description: string;
  requirements: string[];
  vision: ProjectVision;
  status: ProjectStatus;
  tasks: Task[];
  agents: Agent[];
  teams: Team[];
  metadata?: Record<string, unknown>;
  integrations: {
    jira?: ProjectIntegration;
    azure_devops?: ProjectIntegration;
    trello?: ProjectIntegration;
    github?: ProjectIntegration;
    [key: string]: ProjectIntegration | undefined;
  };
  design_system: ProjectDesignSystem;
  features: {
    [key: string]: ProjectFeature;
  };
  analytics: ProjectAnalytics;
  lead_agent: Agent;
}

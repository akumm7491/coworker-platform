export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskType {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  REVIEW = 'review',
  PLANNING = 'planning',
  DEPLOYMENT = 'deployment',
  MONITORING = 'monitoring',
  MAINTENANCE = 'maintenance',
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
}

import { Task } from '@coworker/shared/src/database/entities/Task';
import { Agent } from '@coworker/shared/src/database/entities/Agent';

export interface PlanStep {
  id: string;
  description: string;
  dependencies: string[];
  estimatedDuration: number;
  requiredCapabilities: string[];
  assignedAgent?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  outcome?: Record<string, unknown>;
}

export interface ExecutionPlan {
  id: string;
  taskId: string;
  steps: PlanStep[];
  parallelizableSteps: string[][];
  estimatedCompletion: Date;
  actualStart?: Date;
  actualCompletion?: Date;
  status: 'planning' | 'ready' | 'in_progress' | 'completed' | 'failed';
  metrics?: {
    totalDuration: number;
    successRate: number;
    efficiency: number;
  };
}

export abstract class TaskPlanner {
  protected plans: Map<string, ExecutionPlan>;

  constructor() {
    this.plans = new Map();
  }

  abstract analyzeDependencies(task: Task): Promise<string[]>;

  abstract createExecutionPlan(
    task: Task,
    availableAgents: Agent[]
  ): Promise<ExecutionPlan>;

  abstract optimizePlan(
    plan: ExecutionPlan,
    constraints: Record<string, unknown>
  ): Promise<ExecutionPlan>;

  abstract assignAgents(
    plan: ExecutionPlan,
    availableAgents: Agent[]
  ): Promise<ExecutionPlan>;

  abstract monitorExecution(
    plan: ExecutionPlan
  ): Promise<{
    status: 'on_track' | 'at_risk' | 'delayed';
    metrics: Record<string, number>;
    recommendations?: Record<string, unknown>;
  }>;

  abstract handleFailure(
    plan: ExecutionPlan,
    failedStep: PlanStep,
    error: Error
  ): Promise<{
    updatedPlan: ExecutionPlan;
    recoveryActions: Record<string, unknown>[];
  }>;

  abstract evaluatePerformance(
    plan: ExecutionPlan
  ): Promise<{
    metrics: Record<string, number>;
    learningPoints: Record<string, unknown>[];
    recommendations: string[];
  }>;

  getPlan(planId: string): ExecutionPlan | undefined {
    return this.plans.get(planId);
  }

  getAllPlans(): ExecutionPlan[] {
    return Array.from(this.plans.values());
  }
}

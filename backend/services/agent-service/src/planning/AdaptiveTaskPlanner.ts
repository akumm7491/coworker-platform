import { Task } from '../domain/planning/entities/task.entity';
import { Agent } from '@coworker/shared/dist/database/entities/Agent';
import {
  TaskPlanner,
  ExecutionPlan,
  PlanStep,
} from '../../../../packages/agents/planning/TaskPlanner';
import { v4 as uuidv4 } from 'uuid';

interface TaskDependency {
  id: string;
  weight: number;
  type: 'hard' | 'soft';
}

interface AgentCapabilityScore {
  agentId: string;
  stepId: string;
  score: number;
  confidence: number;
}

interface TaskStep {
  description: string;
  dependencies: string[];
  estimatedDuration: number;
  requiredCapabilities: string[];
}

export class AdaptiveTaskPlanner extends TaskPlanner {
  private capabilityScores: Map<string, AgentCapabilityScore[]> = new Map();
  private dependencyGraph: Map<string, TaskDependency[]> = new Map();
  private status: 'on_track' | 'at_risk' | 'delayed' = 'on_track';
  private metrics: Record<string, number> = {};

  async analyzeDependencies(task: Task): Promise<string[]> {
    if (!task) {
      throw new Error('Task cannot be null or undefined');
    }

    const dependencies: string[] = [];

    if (task.metadata?.dependencies) {
      dependencies.push(...(task.metadata.dependencies as string[]));
    }

    return dependencies;
  }

  private async breakdownTask(task: Task): Promise<TaskStep[]> {
    // This would involve NLP or pattern matching in a real implementation
    // For now, create a simple single-step breakdown
    return [
      {
        description: task.description || '',
        dependencies: [],
        estimatedDuration: 60, // Default 1 hour
        requiredCapabilities: ['default'],
      },
    ];
  }

  async createExecutionPlan(task: Task, availableAgents: Agent[]): Promise<ExecutionPlan> {
    if (!task) {
      throw new Error('Task cannot be null or undefined');
    }
    if (!availableAgents || availableAgents.length === 0) {
      throw new Error('No available agents provided');
    }

    const steps: PlanStep[] = [];
    await this.analyzeDependencies(task);

    const taskSteps = await this.breakdownTask(task);

    for (const step of taskSteps) {
      const planStep: PlanStep = {
        id: uuidv4(),
        description: step.description,
        dependencies: step.dependencies,
        estimatedDuration: step.estimatedDuration,
        requiredCapabilities: step.requiredCapabilities,
        status: 'pending',
      };
      steps.push(planStep);
    }

    const parallelizableSteps = this.identifyParallelSteps(steps);

    const plan: ExecutionPlan = {
      id: uuidv4(),
      taskId: task.id,
      steps,
      parallelizableSteps,
      estimatedCompletion: this.calculateEstimatedCompletion(steps),
      status: 'planning',
    };

    const optimizedPlan = await this.optimizePlan(plan, {
      maxParallelization: 3,
      prioritizeSpeed: true,
    });

    return await this.assignAgents(optimizedPlan, availableAgents);
  }

  private identifyParallelSteps(steps: PlanStep[]): string[][] {
    const parallelGroups: string[][] = [];
    const visited = new Set<string>();

    for (const step of steps) {
      if (visited.has(step.id)) continue;

      const group: string[] = [step.id];
      visited.add(step.id);

      // Find other steps that can run in parallel with this step
      for (const otherStep of steps) {
        if (visited.has(otherStep.id)) continue;
        if (this.canRunInParallel(step, otherStep, steps)) {
          group.push(otherStep.id);
          visited.add(otherStep.id);
        }
      }

      if (group.length > 1) {
        parallelGroups.push(group);
      }
    }

    return parallelGroups;
  }

  private canRunInParallel(step1: PlanStep, step2: PlanStep, allSteps: PlanStep[]): boolean {
    // Check if neither step depends on the other
    if (step1.dependencies.includes(step2.id) || step2.dependencies.includes(step1.id)) {
      return false;
    }

    // Check if they don't share any common dependencies
    const step1Deps = new Set(this.getAllDependencies(step1, allSteps));
    const step2Deps = new Set(this.getAllDependencies(step2, allSteps));

    return !Array.from(step1Deps).some(dep => step2Deps.has(dep));
  }

  private getAllDependencies(step: PlanStep, allSteps: PlanStep[]): string[] {
    const deps = new Set<string>();
    const visited = new Set<string>();

    const traverse = (stepId: string) => {
      if (visited.has(stepId)) return;
      visited.add(stepId);

      const currentStep = allSteps.find(s => s.id === stepId);
      if (!currentStep) return;

      currentStep.dependencies.forEach(depId => {
        deps.add(depId);
        traverse(depId);
      });
    };

    traverse(step.id);
    return Array.from(deps);
  }

  private calculateEstimatedCompletion(steps: PlanStep[]): Date {
    const totalDuration = steps.reduce((sum, step) => sum + (step.estimatedDuration || 0), 0);
    return new Date(Date.now() + totalDuration * 60 * 1000);
  }

  async optimizePlan(
    plan: ExecutionPlan,
    constraints: Record<string, unknown>
  ): Promise<ExecutionPlan> {
    if (!plan) {
      throw new Error('Plan cannot be null or undefined');
    }

    const optimizedPlan = { ...plan };
    optimizedPlan.steps = this.optimizeStepOrder(plan.steps, constraints);
    optimizedPlan.parallelizableSteps = this.identifyParallelSteps(optimizedPlan.steps);
    optimizedPlan.estimatedCompletion = this.calculateEstimatedCompletion(optimizedPlan.steps);

    return optimizedPlan;
  }

  private async calculateAgentCapabilityScores(
    steps: PlanStep[],
    agents: Agent[]
  ): Promise<Map<string, AgentCapabilityScore[]>> {
    const scores = new Map<string, AgentCapabilityScore[]>();

    for (const agent of agents) {
      const agentScores: AgentCapabilityScore[] = [];

      for (const step of steps) {
        const score = this.calculateAgentStepScore(agent, step);
        agentScores.push({
          agentId: agent.id,
          stepId: step.id,
          score: score.score,
          confidence: score.confidence,
        });
      }

      scores.set(agent.id, agentScores);
    }

    return scores;
  }

  private calculateAgentStepScore(
    agent: Agent,
    step: PlanStep
  ): { score: number; confidence: number } {
    // Simple scoring based on capability matching
    const requiredCapabilities = new Set(step.requiredCapabilities || []);
    const agentCapabilities = new Set(agent.capabilities || []);

    const matchingCapabilities = Array.from(requiredCapabilities).filter(cap =>
      agentCapabilities.has(cap)
    ).length;

    const score =
      requiredCapabilities.size > 0 ? matchingCapabilities / requiredCapabilities.size : 1;

    const confidence = 0.8; // Fixed confidence for now

    return { score, confidence };
  }

  private findBestAgentForStep(
    step: PlanStep,
    agents: Agent[],
    agentScores: Map<string, AgentCapabilityScore[]>
  ): Agent | undefined {
    let bestAgent: Agent | undefined;
    let bestScore = -1;

    for (const agent of agents) {
      const agentStepScores = agentScores.get(agent.id);
      if (!agentStepScores) continue;

      const stepScore = agentStepScores.find(score => score.stepId === step.id);
      if (!stepScore) continue;

      if (stepScore.score > bestScore) {
        bestScore = stepScore.score;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  private findImpactedSteps(plan: ExecutionPlan, failedStep: PlanStep): PlanStep[] {
    return this.findDependents(failedStep.id, plan);
  }

  private async generateRecoveryPlan(
    plan: ExecutionPlan,
    failedStep: PlanStep,
    impactedSteps: PlanStep[],
    error: Error
  ): Promise<{ actions: Record<string, unknown>[] }> {
    const actions: Record<string, unknown>[] = [];

    // First, try to retry the failed step
    if ((failedStep.retryCount || 0) < 3) {
      actions.push({
        type: 'retry',
        stepId: failedStep.id,
      });
    } else {
      // If retry limit reached, try reassigning to a different agent
      actions.push({
        type: 'reassign',
        stepId: failedStep.id,
      });

      // If there are impacted steps, replan them
      if (impactedSteps.length > 0) {
        actions.push({
          type: 'replan',
          steps: impactedSteps.map(step => step.id),
        });
      }
    }

    return { actions };
  }

  private calculateActualDuration(plan: ExecutionPlan): number {
    let totalDuration = 0;

    for (const step of plan.steps) {
      if (step.startTime && step.endTime) {
        const duration = new Date(step.endTime).getTime() - new Date(step.startTime).getTime();
        totalDuration += duration;
      }
    }

    return totalDuration / (60 * 1000); // Convert to minutes
  }

  private calculateEstimatedDuration(plan: ExecutionPlan): number {
    return plan.steps.reduce((sum, step) => sum + (step.estimatedDuration || 0), 0);
  }

  private calculateCompletionRate(plan: ExecutionPlan): number {
    const completedSteps = plan.steps.filter(s => s.status === 'completed').length;
    return completedSteps / plan.steps.length;
  }

  private calculateEfficiency(plan: ExecutionPlan): number {
    const completedSteps = plan.steps.filter(s => s.status === 'completed');
    if (completedSteps.length === 0) return 1;

    let totalEfficiency = 0;
    for (const step of completedSteps) {
      if (step.startTime && step.endTime && step.estimatedDuration) {
        const actualDuration =
          (new Date(step.endTime).getTime() - new Date(step.startTime).getTime()) / (60 * 1000);
        const efficiency = step.estimatedDuration / actualDuration;
        totalEfficiency += efficiency;
      }
    }

    return totalEfficiency / completedSteps.length;
  }

  private calculateAgentPerformance(plan: ExecutionPlan): number {
    const completedSteps = plan.steps.filter(s => s.status === 'completed');
    if (completedSteps.length === 0) return 1;

    const successfulSteps = completedSteps.filter(s => !s.errors?.length);
    return successfulSteps.length / completedSteps.length;
  }

  private calculatePlanAccuracy(plan: ExecutionPlan): number {
    const completedSteps = plan.steps.filter(s => s.status === 'completed');
    if (completedSteps.length === 0) return 1;

    let totalAccuracy = 0;
    for (const step of completedSteps) {
      if (step.startTime && step.endTime && step.estimatedDuration) {
        const actualDuration =
          (new Date(step.endTime).getTime() - new Date(step.startTime).getTime()) / (60 * 1000);
        const accuracy =
          Math.min(step.estimatedDuration, actualDuration) /
          Math.max(step.estimatedDuration, actualDuration);
        totalAccuracy += accuracy;
      }
    }

    return totalAccuracy / completedSteps.length;
  }
}

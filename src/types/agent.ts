export type AgentType =
  | 'director'
  | 'architect'
  | 'developer'
  | 'qa'
  | 'devops'
  | 'analytics'
  | 'ai'
  | 'human';
export type AgentStatus = 'idle' | 'working' | 'error' | 'active' | 'paused' | 'completed';

export interface Agent {
  id: string;
  name: string;
  description?: string;
  type: AgentType;
  status: AgentStatus;
  workload: number;
  activeTasks: number;
  currentTask?: string;
  capabilities?: string[];
  maxConcurrentTasks?: number;
  learningRate?: number;
  performance: {
    tasksCompleted: number;
    successRate: number;
    averageTime: number;
  };
}

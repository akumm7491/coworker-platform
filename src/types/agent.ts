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
  performance: {
    tasksCompleted: number;
    successRate: number;
    averageTime: number;
  };
  capabilities?: string[];
  createdAt?: string;
  updatedAt?: string;
  currentTask?: {
    id: string;
    title: string;
    progress: number;
  };
  learningRate?: number;
  maxConcurrentTasks?: number;
}

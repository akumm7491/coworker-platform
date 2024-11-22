import { Task } from './Task.js';
import { Agent } from '../database/entities/Agent.js';

export interface TaskExecution {
  id: string;
  task: Task;
  agent: Agent;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  logs: string[];
  error?: string;
  resourceUsage?: {
    cpu?: number;
    memory?: number;
  };
  metrics: Record<string, number>;
}

import { Agent } from '../database/entities/Agent.js';
import { Task } from './Task.js';
import { AgentStatus } from './AgentStatus.js';

export interface AgentEventPayload {
  agent: Agent;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  task?: Task;
  status?: AgentStatus;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  knowledge?: {
    type: string;
    content: unknown;
  };
  collaboration?: {
    sessionId: string;
    participants: Agent[];
  };
}

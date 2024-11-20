export interface TaskResult {
  taskId: string;
  result: unknown;
  status: 'SUCCESS' | 'FAILURE';
  error?: string;
}

export interface AgentConfiguration {
  maxConcurrentTasks?: number;
  taskTimeout?: number;
  retryAttempts?: number;
  capabilities?: {
    [key: string]: unknown;
  };
}

export interface AgentContext {
  agentId: string;
  taskId: string;
  configuration: AgentConfiguration;
  parameters: Record<string, unknown>;
}

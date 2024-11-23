export enum ProjectStatus {
  PLANNING = 'planning',
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
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

export interface Agent {
  id: string;
  name: string;
  status: string;
  role: string;
}

export interface Team {
  id: string;
  name: string;
  members: Agent[];
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: string;
  assignee?: Agent;
}

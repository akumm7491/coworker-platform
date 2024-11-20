import { ProjectTask } from './task';

export interface ProjectIntegration {
  id: string;
  type: 'github' | 'gitlab' | 'jira' | 'slack' | 'aws' | 'azure';
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  updatedAt: string;
  lastSync?: string;
  config: {
    apiKey?: string;
    url?: string;
    repository?: string;
    project?: string;
    channel?: string;
    region?: string;
    token?: string;
    credentials?: {
      accessKeyId?: string;
      secretAccessKey?: string;
    };
    settings?: Record<string, string | number | boolean>;
  };
}

export interface ProjectEnvironment {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production';
  status: 'active' | 'inactive';
  url?: string;
  lastDeploy?: string;
}

export interface ProjectMetrics {
  taskCompletion: number;
  agentEfficiency: number;
  deploymentFrequency: number;
  errorRate: number;
  timeToResolution: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  completion: number;
  agents_assigned?: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  tasks?: ProjectTask[];
}

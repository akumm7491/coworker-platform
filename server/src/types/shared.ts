export interface Agent {
  id: string;
  name: string;
  type: 'developer' | 'assistant' | 'specialist';
  status: 'idle' | 'busy' | 'offline';
  performance: {
    tasksCompleted: number;
    successRate: number;
    averageTime: number;
  };
  capabilities: string[];
  learningRate: number;
  maxConcurrentTasks: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  completion: number;
  agents_assigned: string[];
  tasks?: ProjectTask[];
  created_at: string;
  updated_at: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  dependencies: string[];
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: Omit<User, 'password'>;
}

export interface ErrorResponse {
  status: number;
  message: string;
  details?: Record<string, unknown>;
}

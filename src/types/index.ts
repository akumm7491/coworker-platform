export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'developer'
  avatar: string
  teams: string[]
  preferences: {
    theme: 'light' | 'dark'
    notifications: boolean
    emailUpdates: boolean
  }
  stats: {
    projectsManaged: number
    agentsSupervised: number
    tasksCompleted: number
  }
}

export interface Agent {
  id: string
  name: string
  type: 'director' | 'architect' | 'developer' | 'qa' | 'devops' | 'analytics'
  status: 'idle' | 'working' | 'error'
  performance: {
    tasksCompleted: number
    successRate: number
    averageTime: number
  }
  currentTask?: {
    id: string
    title: string
    progress: number
  }
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'completed'
  agents: string[]
  tasks: ProjectTask[]
  integrations: ProjectIntegration[]
  environments: ProjectEnvironment[]
  metrics: ProjectMetrics
  settings: {
    autoAssign: boolean
    requireReview: boolean
    notifyOnChange: boolean
  }
}

export interface ProjectTask {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high'
  assignedTo: string
  createdAt: string
  updatedAt: string
  dueDate?: string
  tags: string[]
  dependencies: string[]
  progress: number
}

export interface ProjectIntegration {
  id: string
  type: 'github' | 'gitlab' | 'jira' | 'slack' | 'aws' | 'azure'
  name: string
  status: 'active' | 'inactive' | 'error'
  config: Record<string, any>
  lastSync: string
}

export interface ProjectEnvironment {
  id: string
  name: string
  type: 'development' | 'staging' | 'production'
  status: 'active' | 'inactive'
  url?: string
  lastDeploy?: string
}

export interface ProjectMetrics {
  completionRate: number
  taskSuccessRate: number
  timeEfficiency: number
  resourceUtilization: number
}

export enum AgentType {
  DEVELOPER = 'developer',
  ASSISTANT = 'assistant',
  SPECIALIST = 'specialist',
}

export enum AgentStatus {
  IDLE = 'idle',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

export enum AgentRole {
  LEAD = 'lead',
  WORKER = 'worker',
  REVIEWER = 'reviewer',
  COORDINATOR = 'coordinator',
}

export interface AgentPerformance {
  tasks_completed: number;
  avg_completion_time: number;
  success_rate: number;
  quality_score: number;
  collaboration_score: number;
}

export interface AgentLearningModel {
  model_type: string;
  parameters: Record<string, unknown>;
  training_data: Array<{
    input: unknown;
    output: unknown;
    feedback: unknown;
  }>;
  version: string;
}

export interface AgentWorkingMemory {
  context: Record<string, unknown>;
  short_term: Array<{
    timestamp: string;
    type: string;
    data: unknown;
  }>;
  long_term: Array<{
    category: string;
    knowledge: unknown;
    last_accessed: string;
  }>;
}

export interface AgentCommunication {
  style: string;
  preferences: Record<string, string>;
  history: Array<{
    timestamp: string;
    type: string;
    content: string;
    metadata: Record<string, unknown>;
  }>;
}

export interface AgentSkill {
  name: string;
  level: number;
  experience: number;
  certifications: string[];
  last_used: string;
}

export interface AgentSpecialization {
  domain: string;
  expertise_level: number;
  years_experience: number;
  projects_completed: number;
}

export interface AgentAvailability {
  schedule: {
    working_hours: {
      start: string;
      end: string;
      timezone: string;
    };
    time_off: Array<{
      start_date: string;
      end_date: string;
      reason: string;
    }>;
  };
  current_workload: number;
  max_workload: number;
}

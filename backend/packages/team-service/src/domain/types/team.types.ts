export enum TeamStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface TeamCapabilities {
  [key: string]: number; // capability name -> proficiency level
}

export interface TeamMetrics {
  productivity: number;
  collaboration_score: number;
  task_completion_rate: number;
  quality_score: number;
}

export interface TeamWorkload {
  current_tasks: number;
  available_capacity: number;
  utilization_rate: number;
  task_distribution: Record<string, number>; // agent ID -> number of assigned tasks
}

export interface TeamSchedule {
  working_hours: {
    start: string;
    end: string;
    timezone: string;
  };
  availability: {
    [key: string]: boolean; // day of week -> availability
  };
  time_off: Array<{
    start_date: string;
    end_date: string;
    agent_id: string;
  }>;
}

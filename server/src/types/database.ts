import { Project, ProjectTask, Agent } from './shared.js';

// Database types extend the base types with additional fields
export interface DatabaseProject extends Project {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTask extends ProjectTask {
  id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAgent extends Agent {
  id: string;
  current_task_id?: string;
  created_at: string;
  updated_at: string;
}

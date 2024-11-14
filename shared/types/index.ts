export interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'working' | 'error';
  type: string;
  tasks_completed: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  completion: number;
  agents_assigned: string[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  assigned_agent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WebSocketEvents {
  'agents:update': Agent[];
  'projects:update': Project[];
  'tasks:update': Task[];
}

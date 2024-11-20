export interface ProjectTask {
  id: string;
  title: string;
  description?: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  projectId: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    description?: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
    completion: number;
    agents_assigned?: string[];
    ownerId: string;
    createdAt: string;
    updatedAt: string;
  };
}

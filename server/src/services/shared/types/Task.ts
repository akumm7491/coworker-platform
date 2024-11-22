export interface Task {
  id: string;
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
  requirements?: {
    capabilities?: string[];
    resources?: {
      cpu?: number;
      memory?: number;
      storage?: number;
    };
    dependencies?: string[];
  };
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

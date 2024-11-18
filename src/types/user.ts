export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'developer';
  avatar: string;
  teams: string[];
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    emailUpdates: boolean;
  };
  stats: {
    projectsManaged: number;
    agentsSupervised: number;
    tasksCompleted: number;
  };
}

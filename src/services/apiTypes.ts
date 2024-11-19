import { AuthResponse, LoginData, RegisterData, AuthUser } from '@/types/auth';
import { Project } from '@/types/project';
import { ProjectTask } from '@/types/task';
import { Agent } from '@/types/agent';

declare module 'axios' {
  interface AxiosInstance {
    // Authentication
    login(data: LoginData): Promise<AuthResponse>;
    register(data: RegisterData): Promise<AuthResponse>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<AuthUser>;

    // Projects
    getProjects(): Promise<Project[]>;
    getProject(projectId: string): Promise<Project>;
    createProject(data: Partial<Project>): Promise<Project>;
    deleteProject(projectId: string): Promise<void>;
    updateProject(data: Partial<Project>): Promise<Project>;

    // Tasks
    getTasks(projectId: string): Promise<ProjectTask[]>;
    getTask(taskId: string): Promise<ProjectTask>;
    createTask(projectId: string, data: Partial<ProjectTask>): Promise<ProjectTask>;
    updateTask(projectId: string, taskId: string, data: Partial<ProjectTask>): Promise<ProjectTask>;
    deleteTask(projectId: string, taskId: string): Promise<void>;

    // Agents
    getAgents(): Promise<Agent[]>;
    createAgent(data: Partial<Agent>): Promise<Agent>;
    deleteAgent(agentId: string): Promise<void>;
    updateAgent(data: Partial<Agent>): Promise<Agent>;
  }
}

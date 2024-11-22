import { Project, ProjectStatus, Task } from '../types/agent/index.js';

export interface IProjectService {
    createProject(name: string, description: string): Promise<Project>;
    getProjectById(id: string): Promise<Project | null>;
    updateProjectStatus(id: string, status: ProjectStatus): Promise<Project>;
    listProjects(): Promise<Project[]>;
    deleteProject(id: string): Promise<void>;
    addTaskToProject(projectId: string, task: Task): Promise<Project>;
    getProjectTasks(projectId: string): Promise<Task[]>;
}

import { Task, TaskStatus } from '../types/agent/index.js';

export interface ITaskService {
    createTask(taskData: Partial<Task>): Promise<Task>;
    getTaskById(id: string): Promise<Task | null>;
    updateTaskStatus(id: string, status: TaskStatus): Promise<Task>;
    listTasks(filters?: { projectId?: string; agentId?: string }): Promise<Task[]>;
    deleteTask(id: string): Promise<void>;
    assignToAgent(taskId: string, agentId: string): Promise<Task>;
    findByStatus(status: TaskStatus): Promise<Task[]>;
}

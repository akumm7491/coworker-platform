import './apiTypes';
import axios from 'axios';
import { InternalAxiosRequestConfig } from 'axios';
import { AuthResponse, LoginData, RegisterData, AuthUser } from '@/types/auth';
import { Project } from '@/types/project';
import { ProjectTask } from '@/types/task';
import { Agent } from '@/types/agent';
import { getTokens, saveTokens, saveUser, clearAuth } from '@/utils/tokenStorage';

// Configure axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3457',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = getTokens();
    if (tokens?.accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Authentication
api.login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/login', data);
  const { tokens, user } = response.data;
  saveTokens(tokens);
  saveUser(user);
  return response.data;
};

api.register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/register', data);
  const { tokens, user } = response.data;
  saveTokens(tokens);
  saveUser(user);
  return response.data;
};

api.logout = async (): Promise<void> => {
  try {
    await api.post('/api/auth/logout');
  } finally {
    clearAuth();
  }
};

// Current User
api.getCurrentUser = async (): Promise<AuthUser> => {
  const response = await api.get<AuthUser>('/api/auth/me');
  return response.data;
};

// Projects
api.getProjects = async (): Promise<Project[]> => {
  const response = await api.get<Project[]>('/api/projects');
  return response.data;
};

api.createProject = async (data: Partial<Project>): Promise<Project> => {
  const response = await api.post<Project>('/api/projects', data);
  return response.data;
};

api.updateProject = async (data: Partial<Project>): Promise<Project> => {
  return api.put(`/api/projects/${data.id}`, data).then(response => response.data);
};

api.deleteProject = async (projectId: string): Promise<void> => {
  return api.delete(`/api/projects/${projectId}`);
};

// Tasks
api.getTasks = async (projectId: string): Promise<ProjectTask[]> => {
  const response = await api.get<ProjectTask[]>(`/api/projects/${projectId}/tasks`);
  return response.data;
};

api.createTask = async (projectId: string, data: Partial<ProjectTask>): Promise<ProjectTask> => {
  const response = await api.post<ProjectTask>(`/api/projects/${projectId}/tasks`, data);
  return response.data;
};

api.updateTask = async (
  projectId: string,
  taskId: string,
  data: Partial<ProjectTask>
): Promise<ProjectTask> => {
  const response = await api.put<ProjectTask>(`/api/projects/${projectId}/tasks/${taskId}`, data);
  return response.data;
};

api.deleteTask = async (projectId: string, taskId: string): Promise<void> => {
  return api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
};

// Agents
api.getAgents = async (): Promise<Agent[]> => {
  const response = await api.get<Agent[]>('/api/agents');
  return response.data;
};

api.createAgent = async (data: Partial<Agent>): Promise<Agent> => {
  const response = await api.post<Agent>('/api/agents', data);
  return response.data;
};

api.deleteAgent = async (agentId: string): Promise<void> => {
  return api.delete(`/api/agents/${agentId}`);
};

export default api;

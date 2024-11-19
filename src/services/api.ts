import './apiTypes';
import axios from 'axios';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse, LoginData, RegisterData, AuthUser } from '@/types/auth';
import { Project } from '@/types/project';
import { ProjectTask } from '@/types/task';
import { Agent } from '@/types/agent';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Configure axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3457',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Queue for token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Add request interceptor for authentication
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Authentication
export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/login', data);
  const { tokens, user } = response.data;
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
  localStorage.setItem('userData', JSON.stringify(user));
  return response.data;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/register', data);
  const { tokens, user } = response.data;
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
  localStorage.setItem('userData', JSON.stringify(user));
  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout');
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// Current User
export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<AuthUser>('/api/auth/me');
  return response.data;
}

// Projects
api.getProjects = async (): Promise<Project[]> => {
  const response = await api.get<Project[]>('/api/projects');
  return response.data;
};

export async function createProject(data: Partial<Project>): Promise<Project> {
  const response = await api.post<Project>('/api/projects', data);
  return response.data;
}

export async function updateProject(data: Partial<Project>): Promise<Project> {
  return api.put(`/api/projects/${data.id}`, data).then(response => response.data);
}

export async function deleteProject(projectId: string): Promise<void> {
  return api.delete(`/api/projects/${projectId}`);
}

// Tasks
export async function getTasks(projectId: string): Promise<ProjectTask[]> {
  const response = await api.get<ProjectTask[]>(`/api/projects/${projectId}/tasks`);
  return response.data;
}

export async function createTask(
  projectId: string,
  data: Partial<ProjectTask>
): Promise<ProjectTask> {
  const response = await api.post<ProjectTask>(
    `/api/projects/${projectId}/tasks`,
    data
  );
  return response.data;
}

export async function updateTask(
  projectId: string,
  taskId: string,
  data: Partial<ProjectTask>
): Promise<ProjectTask> {
  const response = await api.put<ProjectTask>(
    `/api/projects/${projectId}/tasks/${taskId}`,
    data
  );
  return response.data;
}

export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  return api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
}

// Agents
export async function getAgents(): Promise<Agent[]> {
  const response = await api.get<Agent[]>('/api/agents');
  return response.data;
}

export async function createAgent(data: Partial<Agent>): Promise<Agent> {
  const response = await api.post<Agent>('/api/agents', data);
  return response.data;
}

export async function deleteAgent(agentId: string): Promise<void> {
  return api.delete(`/api/agents/${agentId}`);
}

export default api;

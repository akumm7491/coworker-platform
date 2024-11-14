import axios from 'axios';
import { Agent, Project, ProjectTask } from '@/types';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3457';

// Configure axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Agents
export const getAgents = () => api.get<Agent[]>('/api/agents');
export const createAgent = (data: Partial<Agent>) => api.post<Agent>('/api/agents', data);
export const updateAgent = (id: string, data: Partial<Agent>) => api.put<Agent>(`/api/agents/${id}`, data);
export const deleteAgent = (id: string) => api.delete(`/api/agents/${id}`);

// Projects
export const getProjects = () => api.get<Project[]>('/api/projects');
export const createProject = (data: Partial<Project>) => api.post<Project>('/api/projects', data);
export const updateProject = (id: string, data: Partial<Project>) => api.put<Project>(`/api/projects/${id}`, data);
export const deleteProject = (id: string) => api.delete(`/api/projects/${id}`);

// Tasks
export const getTasks = (projectId: string) => api.get<ProjectTask[]>(`/api/projects/${projectId}/tasks`);
export const createTask = (projectId: string, data: Partial<ProjectTask>) => 
  api.post<ProjectTask>(`/api/projects/${projectId}/tasks`, data);
export const updateTask = (projectId: string, taskId: string, data: Partial<ProjectTask>) =>
  api.put<ProjectTask>(`/api/projects/${projectId}/tasks/${taskId}`, data);
export const deleteTask = (projectId: string, taskId: string) =>
  api.delete(`/api/projects/${projectId}/tasks/${taskId}`);

// Error handler
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          localStorage.removeItem('token');
          window.location.href = '/';
          break;
        case 403:
          // Handle forbidden
          break;
        case 404:
          // Handle not found
          break;
        case 500:
          // Handle server error
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

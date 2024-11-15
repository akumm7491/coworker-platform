import axios, { AxiosError } from 'axios';
import { Agent, Project, ProjectTask } from '@/types';

// Configure axios
const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies
});

// Add request interceptor for authentication and debugging
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log the request for debugging
  console.log('Request:', {
    method: config.method,
    url: config.url,
    headers: config.headers,
    data: config.data
  });
  
  return config;
});

// Authentication
export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error: string }>;
    if (axiosError.response?.data?.error) {
      throw new Error(axiosError.response.data.error);
    }
    throw new Error('Failed to register. Please try again.');
  }
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error: string }>;
    if (axiosError.response?.data?.error) {
      throw new Error(axiosError.response.data.error);
    }
    throw new Error('Invalid email or password');
  }
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('token');
  await api.post('/api/auth/logout');
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

// Agents
export const getAgents = async () => {
  const response = await api.get('/api/agents');
  return response.data;
};

export const createAgent = async (data: Partial<Agent>) => {
  const response = await api.post('/api/agents', data);
  return response.data;
};

export const updateAgent = async (id: string, data: Partial<Agent>) => {
  const response = await api.put(`/api/agents/${id}`, data);
  return response.data;
};

export const deleteAgent = async (id: string) => {
  const response = await api.delete(`/api/agents/${id}`);
  return response.data;
};

// Projects
export const getProjects = async () => {
  const response = await api.get('/api/projects');
  return response.data;
};

export const createProject = async (data: Partial<Project>) => {
  const response = await api.post('/api/projects', data);
  return response.data;
};

export const updateProject = async (id: string, data: Partial<Project>) => {
  const response = await api.put(`/api/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id: string) => {
  const response = await api.delete(`/api/projects/${id}`);
  return response.data;
};

// Tasks
export const getTasks = async (projectId: string) => {
  const response = await api.get(`/api/projects/${projectId}/tasks`);
  return response.data;
};

export const createTask = async (projectId: string, data: Partial<ProjectTask>) => {
  const response = await api.post(`/api/projects/${projectId}/tasks`, data);
  return response.data;
};

export const updateTask = async (projectId: string, taskId: string, data: Partial<ProjectTask>) => {
  const response = await api.put(`/api/projects/${projectId}/tasks/${taskId}`, data);
  return response.data;
};

export const deleteTask = async (projectId: string, taskId: string) => {
  const response = await api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
  return response.data;
};

// Error handler
api.interceptors.response.use(
  response => {
    // Log successful response for debugging
    console.log('Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    // Log error response for debugging
    console.log('API Error:', error);
    console.log('Error Config:', error.config);
    console.log('Error Response:', error.response);
    
    if (error.response?.data?.error) {
      console.log('Server error:', error.response.data.error);
    }
    
    // Handle unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Don't redirect, let the component handle the error
    }
    
    return Promise.reject(error);
  }
);

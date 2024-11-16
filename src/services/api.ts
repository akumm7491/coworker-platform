import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Agent, Project, ProjectTask } from '@/types';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  role?: string;
  projects?: Project[];
}

interface AuthResponse extends AuthTokens {
  user: UserData;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginData {
  email: string;
  password: string;
}

// Configure axios
const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

// Add request interceptor for authentication and debugging
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  return config;
});

// Error handler with refresh token logic
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 errors and token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post<AuthTokens>('/api/auth/refresh', {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (error) {
        processQueue(error, null);
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Authentication
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error: string }>;
    if (axiosError.response?.data?.error) {
      throw new Error(axiosError.response.data.error);
    }
    throw new Error('Invalid email or password');
  }
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error: string }>;
    if (axiosError.response?.data?.error) {
      throw new Error(axiosError.response.data.error);
    }
    throw new Error('Failed to register. Please try again.');
  }
};

export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refreshToken');
  try {
    if (refreshToken) {
      await api.post('/api/auth/logout', { refreshToken });
    }
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// Current User
export const getCurrentUser = async (): Promise<UserData> => {
  try {
    const response = await api.get<UserData>('/api/auth/me');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error: string }>;
    if (axiosError.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    throw error;
  }
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

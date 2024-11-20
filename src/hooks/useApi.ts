import axios from 'axios';
import { useCallback } from 'react';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useApi = () => {
  const getProject = useCallback(async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  }, []);

  const getProjects = useCallback(async () => {
    const response = await api.get('/projects');
    return response.data;
  }, []);

  const createProject = useCallback(async (data: any) => {
    const response = await api.post('/projects', data);
    return response.data;
  }, []);

  const updateProject = useCallback(async (projectId: string, data: any) => {
    const response = await api.put(`/projects/${projectId}`, data);
    return response.data;
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    await api.delete(`/projects/${projectId}`);
  }, []);

  return {
    getProject,
    getProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};

export default useApi;

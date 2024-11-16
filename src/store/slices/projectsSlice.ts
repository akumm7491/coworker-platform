import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '@/types';
import * as api from '@/services/api';

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  loading: false,
  error: null
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async () => {
    try {
      return await api.getProjects();
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (project: Partial<Project>) => {
    try {
      return await api.createProject(project);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }: { id: string; data: Partial<Project> }) => {
    try {
      const updatedProject = await api.updateProject(id, data);
      return { id, data: updatedProject };
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch projects';
      })
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create project';
      })
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const { id, data } = action.payload;
        const index = state.projects.findIndex(p => p.id === id);
        if (index !== -1) {
          state.projects[index] = { ...state.projects[index], ...data };
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update project';
      });
  }
});

export default projectsSlice.reducer;

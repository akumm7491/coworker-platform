import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '@/types/project';
import api from '@/services/api';

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async () => {
  try {
    return await api.getProjects();
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
});

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData: Partial<Project>) => {
    try {
      return await api.createProject(projectData);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId: string) => {
    try {
      await api.deleteProject(projectId);
      return projectId;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async (projectData: Partial<Project>) => {
    try {
      return await api.updateProject(projectData);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects(state, action: PayloadAction<Project[]>) {
      state.projects = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProjects.pending, state => {
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
      .addCase(createProject.pending, state => {
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
      .addCase(deleteProject.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(project => project.id !== action.payload);
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete project';
      })
      .addCase(updateProject.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProjectIndex = state.projects.findIndex(
          project => project.id === action.payload.id
        );
        if (updatedProjectIndex !== -1) {
          state.projects[updatedProjectIndex] = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update project';
      });
  },
});

export const { setProjects } = projectsSlice.actions;

export default projectsSlice.reducer;

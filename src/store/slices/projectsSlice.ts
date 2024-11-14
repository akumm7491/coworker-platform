import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '@/types';

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

// Simulated API call - replace with actual API call
const fetchProjectsApi = async (): Promise<Project[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      id: '1',
      name: 'Project Alpha',
      description: 'AI-powered code review and optimization system',
      status: 'active',
      agents: ['agent1', 'agent2'],
      tasks: [],
      integrations: [],
      environments: [],
      metrics: {
        completionRate: 75,
        taskSuccessRate: 85,
        timeEfficiency: 90,
        resourceUtilization: 80
      },
      settings: {
        autoAssign: true,
        requireReview: true,
        notifyOnChange: true
      }
    },
    {
      id: '2',
      name: 'Project Beta',
      description: 'Autonomous testing and deployment pipeline',
      status: 'active',
      agents: ['agent3'],
      tasks: [],
      integrations: [],
      environments: [],
      metrics: {
        completionRate: 60,
        taskSuccessRate: 75,
        timeEfficiency: 85,
        resourceUtilization: 70
      },
      settings: {
        autoAssign: true,
        requireReview: true,
        notifyOnChange: true
      }
    }
  ];
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async () => {
    const response = await fetchProjectsApi();
    return response;
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (project: Partial<Project>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newProject: Project = {
      id: `project_${Date.now()}`,
      name: project.name || '',
      description: project.description || '',
      status: 'active',
      agents: [],
      tasks: [],
      integrations: [],
      environments: [],
      metrics: {
        completionRate: 0,
        taskSuccessRate: 0,
        timeEfficiency: 0,
        resourceUtilization: 0
      },
      settings: {
        autoAssign: project.settings?.autoAssign ?? false,
        requireReview: project.settings?.requireReview ?? true,
        notifyOnChange: project.settings?.notifyOnChange ?? true
      }
    };
    
    return newProject;
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }: { id: string; data: Partial<Project> }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id, data };
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
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        const index = state.projects.findIndex(p => p.id === id);
        if (index !== -1) {
          state.projects[index] = { ...state.projects[index], ...data };
        }
      });
  }
});

export default projectsSlice.reducer;

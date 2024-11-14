import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Project } from '@/types'

interface ProjectsState {
  projects: Project[]
  loading: boolean
  error: string | null
}

const initialState: ProjectsState = {
  projects: [
    {
      id: '1',
      name: 'Project Alpha',
      description: 'AI-driven automation system',
      status: 'active',
      agents: ['1', '2'],
      tasks: [
        {
          id: 't1',
          title: 'Setup Infrastructure',
          description: 'Initialize cloud resources and configure basic services',
          status: 'completed',
          priority: 'high',
          assignedTo: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ['infrastructure', 'setup'],
          dependencies: [],
          progress: 100
        },
        {
          id: 't2',
          title: 'Implement Authentication',
          description: 'Set up user authentication and authorization system',
          status: 'in_progress',
          priority: 'high',
          assignedTo: '2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ['security', 'auth'],
          dependencies: ['t1'],
          progress: 60
        }
      ],
      integrations: [],
      environments: [],
      metrics: {
        completionRate: 75,
        taskSuccessRate: 90,
        timeEfficiency: 85,
        resourceUtilization: 80
      },
      settings: {
        autoAssign: true,
        requireReview: true,
        notifyOnChange: true
      }
    }
  ],
  loading: false,
  error: null
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload)
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.projects[index] = action.payload
      }
    },
    removeProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})

export const {
  setProjects,
  addProject,
  updateProject,
  removeProject,
  setLoading,
  setError
} = projectsSlice.actions

export default projectsSlice.reducer

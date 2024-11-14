import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Agent } from '@/types'

interface AgentsState {
  agents: Agent[]
  loading: boolean
  error: string | null
}

const initialState: AgentsState = {
  agents: [
    {
      id: '1',
      name: 'Director Agent 1',
      type: 'director',
      status: 'idle',
      performance: {
        tasksCompleted: 0,
        successRate: 0,
        averageTime: 0
      }
    },
    {
      id: '2',
      name: 'Developer Agent 1',
      type: 'developer',
      status: 'working',
      performance: {
        tasksCompleted: 5,
        successRate: 90,
        averageTime: 120
      },
      currentTask: {
        id: 't2',
        title: 'Implement Authentication',
        progress: 60
      }
    }
  ],
  loading: false,
  error: null
}

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    setAgents: (state, action: PayloadAction<Agent[]>) => {
      state.agents = action.payload
    },
    addAgent: (state, action: PayloadAction<Agent>) => {
      state.agents.push(action.payload)
    },
    updateAgent: (state, action: PayloadAction<Agent>) => {
      const index = state.agents.findIndex(agent => agent.id === action.payload.id)
      if (index !== -1) {
        state.agents[index] = action.payload
      }
    },
    removeAgent: (state, action: PayloadAction<string>) => {
      state.agents = state.agents.filter(agent => agent.id !== action.payload)
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
  setAgents,
  addAgent,
  updateAgent,
  removeAgent,
  setLoading,
  setError
} = agentsSlice.actions

export default agentsSlice.reducer

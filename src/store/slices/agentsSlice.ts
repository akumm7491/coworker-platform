import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Agent } from '@/types/agent';
import api from '@/services/api';

interface AgentsState {
  agents: Agent[];
  loading: boolean;
  error: string | null;
}

const initialState: AgentsState = {
  agents: [],
  loading: false,
  error: null,
};

export const fetchAgents = createAsyncThunk('agents/fetchAgents', async () => {
  try {
    return await api.getAgents();
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
});

export const createAgent = createAsyncThunk(
  'agents/createAgent',
  async (agentData: Partial<Agent>) => {
    try {
      return await api.createAgent(agentData);
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }
);

export const deleteAgent = createAsyncThunk('agents/deleteAgent', async (agentId: string) => {
  try {
    await api.deleteAgent(agentId);
    return agentId;
  } catch (error) {
    console.error('Error deleting agent:', error);
    throw error;
  }
});

export const updateAgent = createAsyncThunk(
  'agents/updateAgent',
  async (agentData: Partial<Agent>) => {
    try {
      return await api.updateAgent(agentData);
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  }
);

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    setAgents: (state, action: PayloadAction<Agent[]>) => {
      state.agents = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAgents.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = action.payload;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch agents';
      })
      .addCase(createAgent.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAgent.fulfilled, (state, action) => {
        state.loading = false;
        state.agents.push(action.payload);
      })
      .addCase(createAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create agent';
      })
      .addCase(deleteAgent.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAgent.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = state.agents.filter(agent => agent.id !== action.payload);
      })
      .addCase(deleteAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete agent';
      })
      .addCase(updateAgent.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAgent.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = state.agents.map(agent =>
          agent.id === action.payload.id ? action.payload : agent
        );
      })
      .addCase(updateAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update agent';
      });
  },
});

export const { setAgents } = agentsSlice.actions;
export default agentsSlice.reducer;

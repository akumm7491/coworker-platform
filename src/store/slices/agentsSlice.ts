import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Agent } from '@/types';
import * as api from '@/services/api';

interface AgentsState {
  agents: Agent[];
  loading: boolean;
  error: string | null;
}

const initialState: AgentsState = {
  agents: [],
  loading: false,
  error: null
};

export const fetchAgents = createAsyncThunk(
  'agents/fetchAgents',
  async () => {
    try {
      return await api.getAgents();
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  }
);

export const createAgent = createAsyncThunk(
  'agents/createAgent',
  async (agent: Partial<Agent>) => {
    try {
      return await api.createAgent(agent);
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }
);

export const updateAgent = createAsyncThunk(
  'agents/updateAgent',
  async ({ id, data }: { id: string; data: Partial<Agent> }) => {
    try {
      const updatedAgent = await api.updateAgent(id, data);
      return { id, data: updatedAgent };
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  }
);

export const deleteAgent = createAsyncThunk(
  'agents/deleteAgent',
  async (id: string) => {
    try {
      await api.deleteAgent(id);
      return id;
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  }
);

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.pending, (state) => {
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
      .addCase(createAgent.pending, (state) => {
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
      .addCase(updateAgent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAgent.fulfilled, (state, action) => {
        state.loading = false;
        const { id, data } = action.payload;
        const index = state.agents.findIndex(a => a.id === id);
        if (index !== -1) {
          state.agents[index] = { ...state.agents[index], ...data };
        }
      })
      .addCase(updateAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update agent';
      })
      .addCase(deleteAgent.pending, (state) => {
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
      });
  }
});

export default agentsSlice.reducer;

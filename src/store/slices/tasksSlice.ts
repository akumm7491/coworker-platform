import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProjectTask } from '@/types/task';
import api from '@/services/api';

interface TasksState {
  tasks: ProjectTask[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (projectId: string) => {
  try {
    return await api.getTasks(projectId);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
});

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ projectId, task }: { projectId: string; task: Partial<ProjectTask> }) => {
    try {
      return await api.createTask(projectId, task);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({
    projectId,
    taskId,
    data,
  }: {
    projectId: string;
    taskId: string;
    data: Partial<ProjectTask>;
  }) => {
    try {
      return await api.updateTask(projectId, taskId, data);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async ({ projectId, taskId }: { projectId: string; taskId: string }) => {
    try {
      await api.deleteTask(projectId, taskId);
      return taskId;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      .addCase(createTask.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create task';
      })
      .addCase(updateTask.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        );
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update task';
      })
      .addCase(deleteTask.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete task';
      });
  },
});

export default tasksSlice.reducer;

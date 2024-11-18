import { configureStore } from '@reduxjs/toolkit';
import agentsReducer from './slices/agentsSlice';
import projectsReducer from './slices/projectsSlice';
import userReducer from './slices/userSlice';
import authReducer from './slices/authSlice';
import tasksReducer from './slices/tasksSlice';

export const store = configureStore({
  reducer: {
    agents: agentsReducer,
    projects: projectsReducer,
    user: userReducer,
    auth: authReducer,
    tasks: tasksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

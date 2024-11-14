import { configureStore } from '@reduxjs/toolkit'
import {
  agentsReducer,
  projectsReducer,
  userReducer,
  authReducer
} from './slices'

export const store = configureStore({
  reducer: {
    agents: agentsReducer,
    projects: projectsReducer,
    user: userReducer,
    auth: authReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

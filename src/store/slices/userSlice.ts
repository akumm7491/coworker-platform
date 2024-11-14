import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserProfile } from '@/types'

interface UserState {
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  profile: {
    id: '1',
    name: 'Alex Thompson',
    email: 'alex@example.com',
    role: 'admin',
    avatar: '/images/avatars/avatar1.svg',
    teams: ['Platform', 'AI Research'],
    preferences: {
      theme: 'light',
      notifications: true,
      emailUpdates: true
    },
    stats: {
      projectsManaged: 12,
      agentsSupervised: 25,
      tasksCompleted: 147
    }
  },
  loading: false,
  error: null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload }
      }
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserProfile['preferences']>>) => {
      if (state.profile) {
        state.profile.preferences = { ...state.profile.preferences, ...action.payload }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})

export const { updateProfile, updatePreferences, setLoading, setError } = userSlice.actions
export default userSlice.reducer

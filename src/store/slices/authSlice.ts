import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  isAuthenticated: boolean
  user: {
    id: string
    email: string
    name: string
  } | null
  loading: boolean
  error: string | null
  accessToken: string | null
  refreshToken: string | null
}

// Helper function to check if tokens exist and set initial authenticated state
const getInitialAuthState = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const userData = localStorage.getItem('userData');
  let user = null;

  try {
    if (userData) {
      user = JSON.parse(userData);
    }
  } catch (e) {
    console.error('Failed to parse user data:', e);
  }

  return {
    isAuthenticated: !!(accessToken && refreshToken && user), // Set to true if both tokens and user data exist
    user,
    loading: !!(accessToken && refreshToken), // Start loading if we have tokens to verify
    error: null,
    accessToken,
    refreshToken
  };
};

const initialState: AuthState = getInitialAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ id: string; email: string; name: string; accessToken: string; refreshToken: string }>) => {
      const userData = {
        id: action.payload.id,
        email: action.payload.email,
        name: action.payload.name
      };

      state.isAuthenticated = true;
      state.user = userData;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.loading = false;
      state.error = null;
      
      // Store data in localStorage
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('userData', JSON.stringify(userData));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      
      // Clean up localStorage on failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
      
      // Clean up localStorage on logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
    },
    updateTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      
      // Update localStorage with new tokens
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  }
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  updateTokens,
  setLoading 
} = authSlice.actions;

export default authSlice.reducer;

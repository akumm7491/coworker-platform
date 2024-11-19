import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, AuthResponse, AuthUser } from '@/types/auth';
import { saveTokens, saveUser, clearAuth, getTokens, getUser } from '@/utils/tokenStorage';

// Initialize state from localStorage
const storedTokens = getTokens();
const storedUser = getUser();

const initialState: AuthState = {
  user: storedUser,
  accessToken: storedTokens?.accessToken || null,
  refreshToken: storedTokens?.refreshToken || null,
  isAuthenticated: !!storedTokens?.accessToken,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: state => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.tokens.accessToken;
      state.refreshToken = action.payload.tokens.refreshToken;
      state.error = null;
      
      // Save to localStorage
      saveTokens(action.payload.tokens);
      saveUser(action.payload.user);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = action.payload;
      
      // Clear localStorage
      clearAuth();
    },
    logout: state => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Clear localStorage
      clearAuth();
    },
    updateUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      // Update user in localStorage
      saveUser(action.payload);
    },
    updateTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      // Update tokens in localStorage
      saveTokens(action.payload);
    },
    clearError: state => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  updateTokens,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;

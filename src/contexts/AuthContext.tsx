import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { AuthUser } from '@/types/auth';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice';
import api from '@/services/api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  openLogin: () => void;
  openSignup: () => void;
  closeModals: () => void;
  isLoginOpen: boolean;
  isSignupOpen: boolean;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleSignup: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  accessToken: null,
  refreshToken: null,
  openLogin: () => {},
  openSignup: () => {},
  closeModals: () => {},
  isLoginOpen: false,
  isSignupOpen: false,
  handleLogin: async () => {},
  handleSignup: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, accessToken, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const openLogin = () => {
    setIsLoginOpen(true);
    setIsSignupOpen(false);
  };

  const openSignup = () => {
    setIsSignupOpen(true);
    setIsLoginOpen(false);
  };

  const closeModals = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(false);
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      dispatch(loginStart());
      const response = await api.login({ email, password });
      dispatch(loginSuccess(response));
      closeModals();
    } catch (error) {
      dispatch(loginFailure(error instanceof Error ? error.message : 'Login failed'));
      throw error;
    }
  };

  const handleSignup = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    try {
      dispatch(loginStart());
      const response = await api.register({ name, email, password, confirmPassword });
      dispatch(loginSuccess(response));
      closeModals();
    } catch (error) {
      dispatch(loginFailure(error instanceof Error ? error.message : 'Registration failed'));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        accessToken,
        refreshToken,
        openLogin,
        openSignup,
        closeModals,
        isLoginOpen,
        isSignupOpen,
        handleLogin,
        handleSignup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

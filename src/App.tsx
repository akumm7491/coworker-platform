import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice';
import { getCurrentUser } from '@/services/api';
import { router } from './router';
import { AuthProvider } from '@/contexts/AuthContext';

const App: React.FC = () => {
  const dispatch = useDispatch();
  // Remove unused variables from destructuring
  useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userData = localStorage.getItem('userData');

      if (accessToken && refreshToken && userData) {
        dispatch(loginStart());
        try {
          // Verify the session with the backend
          const currentUser = await getCurrentUser();

          // Update the auth state with verified user data and tokens
          dispatch(
            loginSuccess({
              success: true,
              user: currentUser,
              accessToken,
              refreshToken,
            })
          );
        } catch (error) {
          dispatch(loginFailure(error instanceof Error ? error.message : 'Authentication failed'));
          // Clear local storage on auth failure
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
        }
      }
    };

    initializeAuth();
  }, [dispatch]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;

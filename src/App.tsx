import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { loginSuccess, loginFailure, setLoading } from '@/store/slices/authSlice';
import Dashboard from '@/pages/Dashboard';
import Agents from '@/pages/Agents';
import Projects from '@/pages/Projects';
import ProjectDetails from '@/pages/Projects/ProjectDetails';
import Analytics from '@/pages/Analytics';
import Landing from '@/pages/Landing';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { getCurrentUser } from '@/services/api';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userData = localStorage.getItem('userData');
      
      if (accessToken && refreshToken && userData) {
        try {
          // First restore the user data from localStorage
          const parsedUserData = JSON.parse(userData);
          
          // Then verify the session with the backend
          const currentUser = await getCurrentUser();
          
          // Update the auth state with verified user data and tokens
          dispatch(loginSuccess({
            ...currentUser,
            accessToken,
            refreshToken
          }));
        } catch (error) {
          console.error('Failed to restore session:', error);
          dispatch(loginFailure('Session expired. Please log in again.'));
        }
      } else {
        // No stored auth data, just set loading to false
        dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const router = createBrowserRouter([
    {
      path: '/',
      element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />,
    },
    {
      element: <AuthenticatedLayout />,
      children: [
        {
          path: '/dashboard',
          element: <Dashboard />,
        },
        {
          path: '/agents',
          element: <Agents />,
        },
        {
          path: '/projects',
          element: <Projects />,
        },
        {
          path: '/projects/:projectId',
          element: <ProjectDetails />,
        },
        {
          path: '/analytics',
          element: <Analytics />,
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;

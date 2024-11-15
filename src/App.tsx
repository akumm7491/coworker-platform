import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Dashboard from '@/pages/Dashboard';
import Agents from '@/pages/Agents';
import Projects from '@/pages/Projects';
import ProjectDetails from '@/pages/Projects/ProjectDetails';
import Analytics from '@/pages/Analytics';
import Landing from '@/pages/Landing';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { AuthProvider } from '@/contexts/AuthContext';

const App: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const router = createBrowserRouter([
    {
      path: '/',
      element: !isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />,
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
      element: <Navigate to="/" />,
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;

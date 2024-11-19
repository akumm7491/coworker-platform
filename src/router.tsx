import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Agents from './pages/Agents';
import Analytics from './pages/Analytics';
import OAuthCallback from './pages/auth/OAuthCallback';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Public Route component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PublicRoute>
        <Landing />
      </PublicRoute>
    ),
  },
  {
    path: '/oauth/callback',
    element: <OAuthCallback />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/projects',
    element: (
      <ProtectedRoute>
        <Layout>
          <Projects />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/projects/:projectId',
    element: (
      <ProtectedRoute>
        <Layout>
          <ProjectDetails />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/agents',
    element: (
      <ProtectedRoute>
        <Layout>
          <Agents />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/analytics',
    element: (
      <ProtectedRoute>
        <Layout>
          <Analytics />
        </Layout>
      </ProtectedRoute>
    ),
  },
]);

import { Navigate } from 'react-router-dom';

// This file is now just for exporting route-related utilities
export const RedirectToHome = () => <Navigate to="/" replace />;
export const RedirectToDashboard = () => <Navigate to="/dashboard" replace />;
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * ProtectedRoute component handles authentication-based routing
 * - If requireAuth is true (default), redirects to login if not authenticated
 * - If requireAuth is false, redirects to dashboard if authenticated
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation(); 

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If route requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route doesn't require authentication (login/signup) and user is authenticated
  if (!requireAuth && isAuthenticated) {
    // Get the intended destination from location state or default to dashboard
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={redirectTo || from} replace />;
  }

  // User has the correct authentication status for this route
  return <>{children}</>;
};

export default ProtectedRoute;


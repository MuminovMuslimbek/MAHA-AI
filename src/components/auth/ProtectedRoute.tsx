
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface ProtectedRouteProps {
  allowedRoles?: Array<'admin' | 'student'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles = ['admin', 'student']
}) => {
  const { user, loading } = useAuth();
  const { roles, isLoading: rolesLoading, isAdmin, isStudent } = useUserRole();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading || rolesLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has any of the allowed roles
  const hasAllowedRole = roles.some(role => allowedRoles.includes(role));

  // If authenticated but not in allowed roles, redirect to proper dashboard
  if (!hasAllowedRole) {
    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and authorized, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;

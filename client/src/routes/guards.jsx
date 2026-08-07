import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — requires authentication
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400">Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * RoleRoute — requires specific role(s)
 */
export const RoleRoute = ({ children, allowedRoles }) => {
  const { hasRole, isAuthenticated, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400">Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!hasRole(...allowedRoles)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-6xl">🔒</div>
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <p className="text-slate-400">You don't have permission to view this page.</p>
        <a href="/dashboard" className="text-indigo-400 hover:text-indigo-300 underline">Go to Dashboard</a>
      </div>
    );
  }

  return children;
};

/**
 * PublicRoute — redirects authenticated users to dashboard
 */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return children;
};

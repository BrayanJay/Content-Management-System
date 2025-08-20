import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth.js';

const ProtectedRoute = ({ children, requiredRole, requiredPermission, fallback = '/login' }) => {
  const { user, loading, hasRole, hasRoleOrHigher, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallback} replace />;
  }

  // Check role-based access
  if (requiredRole) {
    if (Array.isArray(requiredRole)) {
      // Multiple roles allowed
      if (!requiredRole.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
      }
    } else {
      // Single role or role hierarchy
      if (requiredRole.endsWith('+')) {
        // Role hierarchy (e.g., 'contributor+' means contributor or higher)
        const baseRole = requiredRole.slice(0, -1);
        if (!hasRoleOrHigher(baseRole)) {
          return <Navigate to="/unauthorized" replace />;
        }
      } else {
        // Exact role match
        if (!hasRole(requiredRole)) {
          return <Navigate to="/unauthorized" replace />;
        }
      }
    }
  }

  // Check permission-based access
  if (requiredPermission) {
    const [resource, action] = requiredPermission.split(':');
    if (!hasPermission(resource, action)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  requiredPermission: PropTypes.string,
  fallback: PropTypes.string,
};

export default ProtectedRoute;

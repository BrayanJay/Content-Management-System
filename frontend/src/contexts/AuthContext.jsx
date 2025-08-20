import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { USER_ROLES, ROLE_PERMISSIONS } from '../utils/roleConstants.js';

const AuthContext = createContext();

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated and get user info
  const checkAuth = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (username, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Get updated user info after login
        await checkAuth();
        return { success: true, data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      window.location.href = '/login';
    } catch {
      console.error('Logout failed');
      // Force logout even if request fails
      setUser(null);
      window.location.href = '/login';
    }
  };

  // Check if user has specific permission
  const hasPermission = (resource, action) => {
    if (!user || !user.role) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    if (!rolePermissions) return false;
    
    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions) return false;
    
    return resourcePermissions.includes(action);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Check if user has role or higher
  const hasRoleOrHigher = (role) => {
    if (!user) return false;
    
    const roleHierarchy = [USER_ROLES.VIEWER, USER_ROLES.CONTRIBUTOR, USER_ROLES.EDITOR, USER_ROLES.ADMIN];
    const userRoleIndex = roleHierarchy.indexOf(user.role);
    const requiredRoleIndex = roleHierarchy.indexOf(role);
    
    return userRoleIndex >= requiredRoleIndex;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    hasRole,
    hasRoleOrHigher,
    checkAuth,
    isAuthenticated: !!user,
    USER_ROLES,
    ROLE_PERMISSIONS
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

import RoleManager, { USER_ROLES } from '../utils/roleManager.js';
import { authLogger } from './loggingMiddleware.js';

// Middleware to check if user is authenticated
export const requireAuth = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      await authLogger.unauthorizedAccess(req, 'Accessing protected route without authentication');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // Get user role and add to request
    const userRole = await RoleManager.getUserRole(req.session.userId);
    if (!userRole) {
      await authLogger.unauthorizedAccess(req, 'User not found or no role assigned');
      return res.status(401).json({ 
        success: false, 
        message: 'User not found or invalid session' 
      });
    }
    
    // Set both userRole and userId for backward compatibility
    req.userRole = userRole;
    req.userId = req.session.userId;
    next();
  } catch (error) {
    await authLogger.unauthorizedAccess(req, `Authentication check failed: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication check failed' 
    });
  }
};

// Middleware to check specific permissions
export const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      if (!req.userRole) {
        await authLogger.unauthorizedAccess(req, 'No user role found in request');
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      const hasPermission = RoleManager.hasPermission(req.userRole, resource, action);
      
      if (!hasPermission) {
        await authLogger.unauthorizedAccess(req, 
          `Insufficient permissions: ${req.userRole} cannot ${action} ${resource}`
        );
        return res.status(403).json({ 
          success: false, 
          message: `Insufficient permissions. Required: ${action} on ${resource}`,
          userRole: req.userRole,
          requiredPermission: `${resource}:${action}`
        });
      }
      
      next();
    } catch (error) {
      await authLogger.unauthorizedAccess(req, `Permission check failed: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Permission check failed' 
      });
    }
  };
};

// Middleware to require specific role
export const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.userRole) {
        await authLogger.unauthorizedAccess(req, 'No user role found in request');
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      if (req.userRole !== requiredRole) {
        await authLogger.unauthorizedAccess(req, 
          `Role mismatch: ${req.userRole} is not ${requiredRole}`
        );
        return res.status(403).json({ 
          success: false, 
          message: `Access denied. Required role: ${requiredRole}`,
          userRole: req.userRole,
          requiredRole
        });
      }
      
      next();
    } catch (error) {
      await authLogger.unauthorizedAccess(req, `Role check failed: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Role check failed' 
      });
    }
  };
};

// Middleware to require admin role
export const requireAdmin = requireRole(USER_ROLES.ADMIN);

// Middleware to require editor or above (editor, admin)
export const requireEditor = async (req, res, next) => {
  try {
    if (!req.userRole) {
      await authLogger.unauthorizedAccess(req, 'No user role found in request');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const allowedRoles = [USER_ROLES.ADMIN, USER_ROLES.EDITOR];
    
    if (!allowedRoles.includes(req.userRole)) {
      await authLogger.unauthorizedAccess(req, 
        `Insufficient role: ${req.userRole} is not editor or admin`
      );
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Editor role or higher required',
        userRole: req.userRole,
        requiredRoles: allowedRoles
      });
    }
    
    next();
  } catch (error) {
    await authLogger.unauthorizedAccess(req, `Editor role check failed: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Role check failed' 
    });
  }
};

// Middleware to require contributor or above (contributor, editor, admin)
export const requireContributor = async (req, res, next) => {
  try {
    if (!req.userRole) {
      await authLogger.unauthorizedAccess(req, 'No user role found in request');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const allowedRoles = [USER_ROLES.ADMIN, USER_ROLES.EDITOR, USER_ROLES.CONTRIBUTOR];
    
    if (!allowedRoles.includes(req.userRole)) {
      await authLogger.unauthorizedAccess(req, 
        `Insufficient role: ${req.userRole} cannot contribute`
      );
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Contributor role or higher required',
        userRole: req.userRole,
        requiredRoles: allowedRoles
      });
    }
    
    next();
  } catch (error) {
    await authLogger.unauthorizedAccess(req, `Contributor role check failed: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Role check failed' 
    });
  }
};

// Helper middleware to check if user owns resource or is admin
export const requireOwnershipOrAdmin = (getUserIdFromParams) => {
  return async (req, res, next) => {
    try {
      const targetUserId = getUserIdFromParams(req);
      const currentUserId = req.session.userId;
      
      // Admin can access any resource
      if (req.userRole === USER_ROLES.ADMIN) {
        return next();
      }
      
      // User can access their own resources
      if (currentUserId && targetUserId && currentUserId.toString() === targetUserId.toString()) {
        return next();
      }
      
      await authLogger.unauthorizedAccess(req, 
        `User ${currentUserId} attempted to access resource belonging to user ${targetUserId}`
      );
      
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only access your own resources or need admin privileges' 
      });
    } catch (error) {
      await authLogger.unauthorizedAccess(req, `Ownership check failed: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Access check failed' 
      });
    }
  };
};

export default {
  requireAuth,
  requirePermission,
  requireRole,
  requireAdmin,
  requireEditor,
  requireContributor,
  requireOwnershipOrAdmin
};

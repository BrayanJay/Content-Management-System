import { connectToDatabase } from '../lib/db.js';
import Logger from './logger.js';

// Define user roles and their permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor', 
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer'
};

// Define permissions for each role
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    // Full access to everything
    users: ['create', 'read', 'update', 'delete'],
    content: ['create', 'read', 'update', 'delete'],
    system: ['read', 'update'],
    logs: ['read', 'delete'],
    files: ['upload', 'delete', 'read'],
    branches: ['create', 'read', 'update', 'delete'],
    products: ['create', 'read', 'update', 'delete'],
    profiles: ['create', 'read', 'update', 'delete']
  },
  [USER_ROLES.EDITOR]: {
    // CRUD access but limited
    users: ['read'], // Can only view user info, not manage
    content: ['create', 'read', 'update', 'delete'],
    system: [], // No system access
    logs: ['read'], // Can view logs but not delete
    files: ['upload', 'delete', 'read'],
    branches: ['create', 'read', 'update', 'delete'],
    products: ['create', 'read', 'update', 'delete'],
    profiles: ['create', 'read', 'update', 'delete']
  },
  [USER_ROLES.CONTRIBUTOR]: {
    // Add and edit only
    users: [], // No user access
    content: ['create', 'read', 'update'],
    system: [], // No system access
    logs: [], // No log access
    files: ['upload', 'read'],
    branches: ['create', 'read', 'update'],
    products: ['create', 'read', 'update'],
    profiles: ['create', 'read', 'update']
  },
  [USER_ROLES.VIEWER]: {
    // View only
    users: [], // No user access
    content: ['read'],
    system: [], // No system access
    logs: [], // No log access
    files: ['read'],
    branches: ['read'],
    products: ['read'],
    profiles: ['read']
  }
};

export class RoleManager {
  // Check if a user has a specific permission for a resource
  static hasPermission(userRole, resource, action) {
    if (!userRole || !resource || !action) {
      return false;
    }

    const rolePermissions = ROLE_PERMISSIONS[userRole];
    if (!rolePermissions) {
      return false;
    }

    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions) {
      return false;
    }

    return resourcePermissions.includes(action);
  }

  // Get all permissions for a role
  static getRolePermissions(role) {
    return ROLE_PERMISSIONS[role] || {};
  }

  // Check if role is valid
  static isValidRole(role) {
    return Object.values(USER_ROLES).includes(role);
  }

  // Get user role from database
  static async getUserRole(userId) {
    let connection;
    try {
      connection = await connectToDatabase();
      const [rows] = await connection.execute(
        'SELECT role FROM users WHERE id = ?',
        [userId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0].role;
    } catch (error) {
      await Logger.error({
        category: 'AUTHORIZATION',
        action: 'GET_USER_ROLE_ERROR',
        userId,
        message: 'Failed to get user role',
        details: { error: error.message }
      });
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // Update user role
  static async updateUserRole(adminUserId, targetUserId, newRole, adminUsername) {
    if (!this.isValidRole(newRole)) {
      throw new Error('Invalid role specified');
    }

    let connection;
    try {
      connection = await connectToDatabase();
      
      // Get current role for logging
      const [currentRoleRows] = await connection.execute(
        'SELECT role, username FROM users WHERE id = ?',
        [targetUserId]
      );
      
      if (currentRoleRows.length === 0) {
        throw new Error('User not found');
      }
      
      const oldRole = currentRoleRows[0].role;
      const targetUsername = currentRoleRows[0].username;
      
      // Update role
      await connection.execute(
        'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?',
        [newRole, targetUserId]
      );

      await Logger.security({
        category: 'AUTHORIZATION',
        action: 'ROLE_CHANGE',
        userId: adminUserId,
        username: adminUsername,
        message: `User role changed from ${oldRole} to ${newRole}`,
        details: {
          targetUserId,
          targetUsername,
          oldRole,
          newRole,
          changedBy: adminUsername
        }
      });

      return { success: true, oldRole, newRole };
    } catch (error) {
      await Logger.error({
        category: 'AUTHORIZATION',
        action: 'ROLE_CHANGE_ERROR',
        userId: adminUserId,
        username: adminUsername,
        message: 'Failed to update user role',
        details: { 
          error: error.message, 
          targetUserId, 
          newRole 
        }
      });
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // Get all users with their roles
  static async getAllUsersWithRoles(requestingUserId, requestingUsername) {
    let connection;
    try {
      connection = await connectToDatabase();
      const [rows] = await connection.execute(
        'SELECT id, username, role, created_at, updated_at, last_login FROM users ORDER BY created_at DESC'
      );

      await Logger.info({
        category: 'AUTHORIZATION',
        action: 'VIEW_ALL_USERS',
        userId: requestingUserId,
        username: requestingUsername,
        message: 'Retrieved all users with roles',
        details: { userCount: rows.length }
      });

      return rows;
    } catch (error) {
      await Logger.error({
        category: 'AUTHORIZATION',
        action: 'VIEW_ALL_USERS_ERROR',
        userId: requestingUserId,
        username: requestingUsername,
        message: 'Failed to retrieve users with roles',
        details: { error: error.message }
      });
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}

export default RoleManager;

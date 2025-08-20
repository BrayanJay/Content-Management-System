import express from 'express';
import RoleManager, { USER_ROLES, ROLE_PERMISSIONS } from '../utils/roleManager.js';
import { requireAuth, requireAdmin, requirePermission } from '../middleware/authMiddleware.js';
import Logger from '../utils/logger.js';
import { connectToDatabase } from '../lib/db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

// GET /users - Get all users (Admin only)
router.get('/', requireAdmin, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const users = await RoleManager.getAllUsersWithRoles(
      req.session.userId, 
      req.session.username
    );

    const executionTime = Date.now() - startTime;

    res.json({
      success: true,
      data: users,
      count: users.length,
      executionTime
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    await Logger.error({
      category: 'USER_MANAGEMENT',
      action: 'GET_ALL_USERS_ERROR',
      userId: req.session?.userId,
      username: req.session?.username,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      requestMethod: req.method,
      endpoint: req.originalUrl,
      statusCode: 500,
      message: 'Failed to retrieve users',
      details: { error: error.message },
      executionTimeMs: executionTime,
      sessionId: req.sessionID
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
});

// GET /users/me - Get current user info
router.get('/me', async (req, res) => {
  const startTime = Date.now();
  
  try {
    let connection = await connectToDatabase();
    const [rows] = await connection.execute(
      'SELECT id, username, role, created_at, updated_at, last_login FROM users WHERE id = ?',
      [req.session.userId]
    );
    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = rows[0];
    const permissions = RoleManager.getRolePermissions(user.role);
    const executionTime = Date.now() - startTime;

    await Logger.info({
      category: 'USER_MANAGEMENT',
      action: 'GET_CURRENT_USER',
      userId: req.session.userId,
      username: req.session.username,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      requestMethod: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      message: 'Retrieved current user info',
      executionTimeMs: executionTime,
      sessionId: req.sessionID
    });

    res.json({
      success: true,
      data: {
        ...user,
        permissions
      },
      executionTime
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    await Logger.error({
      category: 'USER_MANAGEMENT',
      action: 'GET_CURRENT_USER_ERROR',
      userId: req.session?.userId,
      username: req.session?.username,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      requestMethod: req.method,
      endpoint: req.originalUrl,
      statusCode: 500,
      message: 'Failed to retrieve current user info',
      details: { error: error.message },
      executionTimeMs: executionTime,
      sessionId: req.sessionID
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user info',
      error: error.message
    });
  }
});

// PUT /users/:id/role - Update user role (Admin only)
router.put('/:id/role', requireAdmin, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const targetUserId = parseInt(req.params.id);
    const { role } = req.body;

    if (!role || !RoleManager.isValidRole(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified',
        validRoles: Object.values(USER_ROLES)
      });
    }

    // Prevent user from changing their own role
    if (targetUserId === req.session.userId) {
      await Logger.warn({
        category: 'USER_MANAGEMENT',
        action: 'SELF_ROLE_CHANGE_ATTEMPT',
        userId: req.session.userId,
        username: req.session.username,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        requestMethod: req.method,
        endpoint: req.originalUrl,
        statusCode: 400,
        message: 'User attempted to change their own role',
        sessionId: req.sessionID
      });

      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    const result = await RoleManager.updateUserRole(
      req.session.userId,
      targetUserId,
      role,
      req.session.username
    );

    const executionTime = Date.now() - startTime;

    res.json({
      success: true,
      message: `User role updated from ${result.oldRole} to ${result.newRole}`,
      data: result,
      executionTime
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    await Logger.error({
      category: 'USER_MANAGEMENT',
      action: 'UPDATE_USER_ROLE_ERROR',
      userId: req.session?.userId,
      username: req.session?.username,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      requestMethod: req.method,
      endpoint: req.originalUrl,
      statusCode: 500,
      message: 'Failed to update user role',
      details: { 
        error: error.message, 
        targetUserId: req.params.id,
        requestedRole: req.body.role 
      },
      executionTimeMs: executionTime,
      sessionId: req.sessionID
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
});

// POST /users - Create new user (Admin only)
router.post('/', requireAdmin, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { username, password, role = USER_ROLES.VIEWER } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    if (!RoleManager.isValidRole(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified',
        validRoles: Object.values(USER_ROLES)
      });
    }

    let connection = await connectToDatabase();
    
    // Check if user exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.execute(
      'INSERT INTO users (username, password, role, created_at) VALUES (?, ?, ?, NOW())',
      [username, hashedPassword, role]
    );
    
    connection.release();

    const executionTime = Date.now() - startTime;

    await Logger.info({
      category: 'USER_MANAGEMENT',
      action: 'CREATE_USER',
      userId: req.session.userId,
      username: req.session.username,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      requestMethod: req.method,
      endpoint: req.originalUrl,
      statusCode: 201,
      message: `Created new user: ${username} with role: ${role}`,
      details: { 
        newUserId: result.insertId,
        newUsername: username,
        newUserRole: role,
        createdBy: req.session.username
      },
      executionTimeMs: executionTime,
      sessionId: req.sessionID
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.insertId,
        username,
        role
      },
      executionTime
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    await Logger.error({
      category: 'USER_MANAGEMENT',
      action: 'CREATE_USER_ERROR',
      userId: req.session?.userId,
      username: req.session?.username,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      requestMethod: req.method,
      endpoint: req.originalUrl,
      statusCode: 500,
      message: 'Failed to create user',
      details: { 
        error: error.message,
        requestedUsername: req.body.username,
        requestedRole: req.body.role
      },
      executionTimeMs: executionTime,
      sessionId: req.sessionID
    });

    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// DELETE /users/:id - Delete user (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const targetUserId = parseInt(req.params.id);

    // Prevent user from deleting themselves
    if (targetUserId === req.session.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    let connection = await connectToDatabase();
    
    // Get user info before deletion
    const [userRows] = await connection.execute(
      'SELECT username, role FROM users WHERE id = ?',
      [targetUserId]
    );
    
    if (userRows.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const deletedUser = userRows[0];
    
    // Delete user
    const [result] = await connection.execute(
      'DELETE FROM users WHERE id = ?',
      [targetUserId]
    );
    
    connection.release();

    const executionTime = Date.now() - startTime;

    await Logger.security({
      category: 'USER_MANAGEMENT',
      action: 'DELETE_USER',
      userId: req.session.userId,
      username: req.session.username,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      requestMethod: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      message: `Deleted user: ${deletedUser.username}`,
      details: { 
        deletedUserId: targetUserId,
        deletedUsername: deletedUser.username,
        deletedUserRole: deletedUser.role,
        deletedBy: req.session.username
      },
      executionTimeMs: executionTime,
      sessionId: req.sessionID
    });

    res.json({
      success: true,
      message: `User ${deletedUser.username} deleted successfully`,
      executionTime
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    await Logger.error({
      category: 'USER_MANAGEMENT',
      action: 'DELETE_USER_ERROR',
      userId: req.session?.userId,
      username: req.session?.username,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      requestMethod: req.method,
      endpoint: req.originalUrl,
      statusCode: 500,
      message: 'Failed to delete user',
      details: { 
        error: error.message,
        targetUserId: req.params.id
      },
      executionTimeMs: executionTime,
      sessionId: req.sessionID
    });

    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// GET /users/roles - Get available roles and permissions (Admin/Editor only)
router.get('/roles', requirePermission('system', 'read'), async (req, res) => {
  try {
    const executionTime = Date.now();

    res.json({
      success: true,
      data: {
        roles: USER_ROLES,
        permissions: ROLE_PERMISSIONS
      },
      executionTime: Date.now() - executionTime
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve roles',
      error: error.message
    });
  }
});

export default router;

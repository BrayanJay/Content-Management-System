import Logger, { extractRequestInfo } from '../utils/logger.js';

// Middleware to log all HTTP requests
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Store start time for execution time calculation
  req.startTime = startTime;
  
  // Override res.end to capture response details
  const originalEnd = res.end;
  
  res.end = function(chunk, encoding) {
    const executionTime = Date.now() - startTime;
    const requestInfo = extractRequestInfo(req);
    
    // Log the request
    Logger.info({
      category: 'HTTP_REQUEST',
      action: `${req.method}_${req.route?.path || req.path}`,
      userId: req.session?.userId,
      username: req.session?.username,
      ...requestInfo,
      statusCode: res.statusCode,
      message: `${req.method} ${req.originalUrl} - ${res.statusCode}`,
      details: {
        requestBody: req.method !== 'GET' ? req.body : undefined,
        query: req.query,
        params: req.params
      },
      executionTimeMs: executionTime
    });
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Middleware to log authentication events
export const authLogger = {
  loginSuccess: async (req, userId, username) => {
    const requestInfo = extractRequestInfo(req);
    
    await Logger.security({
      category: 'AUTHENTICATION',
      action: 'LOGIN_SUCCESS',
      userId,
      username,
      ...requestInfo,
      statusCode: 200,
      message: `User ${username} logged in successfully`,
      details: {
        loginTime: new Date().toISOString()
      }
    });
  },

  loginFailed: async (req, username, reason) => {
    const requestInfo = extractRequestInfo(req);
    
    await Logger.security({
      category: 'AUTHENTICATION',
      action: 'LOGIN_FAILED',
      username,
      ...requestInfo,
      statusCode: 401,
      message: `Login failed for user ${username}`,
      details: {
        reason,
        attemptTime: new Date().toISOString()
      }
    });
  },

  logout: async (req, userId, username) => {
    const requestInfo = extractRequestInfo(req);
    
    await Logger.security({
      category: 'AUTHENTICATION',
      action: 'LOGOUT',
      userId,
      username,
      ...requestInfo,
      statusCode: 200,
      message: `User ${username} logged out`,
      details: {
        logoutTime: new Date().toISOString()
      }
    });
  },

  unauthorizedAccess: async (req, attemptedAction) => {
    const requestInfo = extractRequestInfo(req);
    
    await Logger.security({
      category: 'SECURITY',
      action: 'UNAUTHORIZED_ACCESS',
      userId: req.session?.userId,
      username: req.session?.username,
      ...requestInfo,
      statusCode: 403,
      message: `Unauthorized access attempt`,
      details: {
        attemptedAction,
        attemptTime: new Date().toISOString()
      }
    });
  }
};

// Middleware to log errors
export const errorLogger = (err, req, res, next) => {
  const executionTime = req.startTime ? Date.now() - req.startTime : null;
  const requestInfo = extractRequestInfo(req);
  
  Logger.error({
    category: 'APPLICATION_ERROR',
    action: 'UNHANDLED_ERROR',
    userId: req.session?.userId,
    username: req.session?.username,
    ...requestInfo,
    statusCode: err.status || 500,
    message: err.message || 'Internal Server Error',
    details: {
      stack: err.stack,
      requestBody: req.body,
      query: req.query,
      params: req.params
    },
    executionTimeMs: executionTime
  });
  
  next(err);
};

// Helper function to log database operations
export const dbLogger = {
  success: async (operation, table, userId, username, details = {}) => {
    await Logger.info({
      category: 'DATABASE',
      action: `DB_${operation.toUpperCase()}_SUCCESS`,
      userId,
      username,
      message: `Database ${operation} operation on ${table} completed successfully`,
      details: {
        table,
        operation,
        ...details
      }
    });
  },

  error: async (operation, table, error, userId, username, details = {}) => {
    await Logger.error({
      category: 'DATABASE',
      action: `DB_${operation.toUpperCase()}_ERROR`,
      userId,
      username,
      message: `Database ${operation} operation on ${table} failed`,
      details: {
        table,
        operation,
        error: error.message,
        ...details
      }
    });
  }
};

// Helper function to log file operations
export const fileLogger = {
  upload: async (req, fileName, directory, success = true, details = {}) => {
    const requestInfo = extractRequestInfo(req);
    const level = success ? 'info' : 'error';
    const action = success ? 'FILE_UPLOAD_SUCCESS' : 'FILE_UPLOAD_ERROR';
    
    await Logger[level]({
      category: 'FILE_OPERATION',
      action,
      userId: req.session?.userId,
      username: req.session?.username,
      ...requestInfo,
      statusCode: success ? 200 : 500,
      message: `File upload ${success ? 'successful' : 'failed'}: ${fileName}`,
      details: {
        fileName,
        directory,
        ...details
      }
    });
  },

  delete: async (req, fileName, success = true, details = {}) => {
    const requestInfo = extractRequestInfo(req);
    const level = success ? 'info' : 'error';
    const action = success ? 'FILE_DELETE_SUCCESS' : 'FILE_DELETE_ERROR';
    
    await Logger[level]({
      category: 'FILE_OPERATION',
      action,
      userId: req.session?.userId,
      username: req.session?.username,
      ...requestInfo,
      statusCode: success ? 200 : 500,
      message: `File deletion ${success ? 'successful' : 'failed'}: ${fileName}`,
      details: {
        fileName,
        ...details
      }
    });
  }
};

export default {
  requestLogger,
  authLogger,
  errorLogger,
  dbLogger,
  fileLogger
};

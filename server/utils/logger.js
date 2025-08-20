import { connectToDatabase } from '../lib/db.js';

export class Logger {

  static async log({
    level,
    category,
    action,
    userId = null,
    username = null,
    ipAddress = null,
    userAgent = null,
    requestMethod = null,
    endpoint = null,
    statusCode = null,
    message,
    details = null,
    executionTimeMs = null,
    sessionId = null
  }) {
    let connection;
    try {
      connection = await connectToDatabase();
      
      const query = `
        INSERT INTO logger (
          level, category, action, user_id, username, ip_address, 
          user_agent, request_method, endpoint, status_code, 
          message, details, execution_time_ms, session_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        level,
        category,
        action,
        userId,
        username,
        ipAddress,
        userAgent,
        requestMethod,
        endpoint,
        statusCode,
        message,
        details ? JSON.stringify(details) : null,
        executionTimeMs,
        sessionId
      ];
      
      await connection.execute(query, values);
      
    } catch (error) {
      console.error('Logger error:', error);
      // Don't throw error to prevent logging from breaking the main application
    } finally {
      if (connection) connection.release();
    }
  }

  // Convenience methods for different log levels
  static async info(params) {
    return this.log({ ...params, level: 'INFO' });
  }

  static async warn(params) {
    return this.log({ ...params, level: 'WARN' });
  }

  static async error(params) {
    return this.log({ ...params, level: 'ERROR' });
  }

  static async debug(params) {
    return this.log({ ...params, level: 'DEBUG' });
  }

  static async security(params) {
    return this.log({ ...params, level: 'SECURITY' });
  }

  // Method to retrieve logs with filtering
  static async getLogs({
    level = null,
    category = null,
    userId = null,
    startDate = null,
    endDate = null,
    limit = 100,
    offset = 0,
    orderBy = 'timestamp',
    orderDirection = 'DESC'
  } = {}) {
    let connection;
    let query = '';
    const values = [];

    try {
      connection = await connectToDatabase();
      
      query = 'SELECT * FROM logger WHERE 1=1';

      if (level) {
        query += ' AND level = ?';
        values.push(level);
      }
      if (category) {
        query += ' AND category = ?';
        values.push(category);
      }
      if (userId) {
        query += ' AND user_id = ?';
        values.push(userId);
      }
      if (startDate) {
        query += ' AND timestamp >= ?';
        values.push(startDate);
      }
      if (endDate) {
        query += ' AND timestamp <= ?';
        values.push(endDate);
      }

      // Sanitize orderBy and orderDirection
      const allowedColumns = ['timestamp', 'level', 'category', 'username', 'action'];
      const allowedDirections = ['ASC', 'DESC'];

      if (!allowedColumns.includes(orderBy)) orderBy = 'timestamp';
      if (!allowedDirections.includes(orderDirection.toUpperCase())) orderDirection = 'DESC';

      // Directly inject LIMIT and OFFSET (must be integers)
      const safeLimit = parseInt(limit) || 100;
      const safeOffset = parseInt(offset) || 0;

      query += ` ORDER BY ${orderBy} ${orderDirection} LIMIT ${safeLimit} OFFSET ${safeOffset}`;

      const [rows] = await connection.execute(query, values);
      
      // Parse JSON details for each log entry
      const logs = rows.map(row => ({
        ...row,
        details: row.details ? JSON.parse(row.details) : null
      }));

      return logs;
    } catch (error) {
      console.error('Error retrieving logs:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // Method to get log statistics
  static async getLogStats({
    startDate = null,
    endDate = null,
    groupBy = 'level'
  } = {}) {
    let connection;
    try {
      connection = await connectToDatabase();
      
      let query = `
        SELECT ${groupBy}, COUNT(*) as count 
        FROM logger 
        WHERE 1=1
      `;
      const values = [];

      if (startDate) {
        query += ' AND timestamp >= ?';
        values.push(startDate);
      }

      if (endDate) {
        query += ' AND timestamp <= ?';
        values.push(endDate);
      }

      query += ` GROUP BY ${groupBy} ORDER BY count DESC`;

      const [rows] = await connection.execute(query, values);
      return rows;
    } catch (error) {
      console.error('Error retrieving log stats:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // Method to delete old logs
  static async cleanupLogs(daysToKeep = 30) {
    let connection;
    try {
      connection = await connectToDatabase();
      
      const query = 'DELETE FROM logger WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)';
      const [result] = await connection.execute(query, [daysToKeep]);
      
      return { deletedRows: result.affectedRows };
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
  
}

// Helper function to extract request info
export const extractRequestInfo = (req) => {
  return {
    ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0],
    userAgent: req.headers['user-agent'],
    requestMethod: req.method,
    endpoint: req.originalUrl || req.url,
    sessionId: req.sessionID
  };
};

export default Logger;

import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import { connectToDatabase } from '../lib/db.js';

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

// GET /logs - Retrieve logs with filtering (Admin only)
router.get('/', requireAdmin, async (req, res) => {
  const {
    level,
    category,
    userId,
    startDate,
    endDate,
    limit = 100,
    offset = 0,
    orderBy = 'timestamp',
    orderDirection = 'DESC'
  } = req.query;

  let connection;
  try {
    connection = await connectToDatabase();
    
    let query = 'SELECT * FROM logger WHERE 1=1';
    const values = [];

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
      values.push(parseInt(userId));
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

    const safeOrderBy = allowedColumns.includes(orderBy) ? orderBy : 'timestamp';
    const safeOrderDirection = allowedDirections.includes(orderDirection.toUpperCase()) ? orderDirection.toUpperCase() : 'DESC';

    const safeLimit = parseInt(limit) || 100;
    const safeOffset = parseInt(offset) || 0;

    query += ` ORDER BY ${safeOrderBy} ${safeOrderDirection} LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const [rows] = await connection.execute(query, values);
    
    // Parse JSON details for each log entry safely
    const logs = rows.map(row => {
      let parsedDetails = null;
      
      if (row.details) {
        try {
          // Handle different types of details data
          if (typeof row.details === 'string') {
            // Skip parsing if it's the invalid "[object Object]" string
            if (row.details === '[object Object]') {
              parsedDetails = null;
            } else {
              parsedDetails = JSON.parse(row.details);
            }
          } else {
            // If it's already an object, use it directly
            parsedDetails = row.details;
          }
        } catch (e) {
          console.error("Error parsing JSON details for log ID", row.id, ":", e);
          parsedDetails = null; // Set to null if parsing fails
        }
      }
      
      return {
        ...row,
        details: parsedDetails
      };
    });

    res.json({
      success: true,
      data: logs,
      count: logs.length
    });

  } catch (error) {
    console.error('GET /logs error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      query: req.query
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve logs',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// GET /logs/stats - Get log statistics (Admin only)
router.get('/stats', requireAdmin, async (req, res) => {
  const { startDate, endDate, groupBy = 'level' } = req.query;

  let connection;
  try {
    connection = await connectToDatabase();
    
    let query = `SELECT ${groupBy}, COUNT(*) as count FROM logger WHERE 1=1`;
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

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('GET /logs/stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve log statistics',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// POST /logs/cleanup - Clean up old logs (Admin only)
router.post('/cleanup', requireAdmin, async (req, res) => {
  const { daysToKeep = 30 } = req.body;

  let connection;
  try {
    connection = await connectToDatabase();
    
    const query = 'DELETE FROM logger WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)';
    const [result] = await connection.execute(query, [daysToKeep]);

    res.json({
      success: true,
      message: `Successfully cleaned up ${result.affectedRows} old log entries`,
      deletedRows: result.affectedRows
    });

  } catch (error) {
    console.error('POST /logs/cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup logs',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// POST /logs - Manually create a log entry (Admin only)
router.post('/', requireAdmin, async (req, res) => {
  const {
    level,
    category,
    action,
    message,
    details,
    userId,
    username
  } = req.body;

  // Validate required fields
  if (!level || !category || !action || !message) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: level, category, action, message'
    });
  }

  let connection;
  try {
    connection = await connectToDatabase();
    
    const query = `
      INSERT INTO logger (
        level, category, action, user_id, username, ip_address, 
        user_agent, request_method, endpoint, status_code, 
        message, details, session_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      level,
      category,
      action,
      userId || req.session?.userId,
      username || req.session?.username,
      req.ip,
      req.headers['user-agent'],
      req.method,
      req.originalUrl,
      201,
      message,
      details ? JSON.stringify(details) : null,
      req.sessionID
    ];

    await connection.execute(query, values);

    res.status(201).json({
      success: true,
      message: 'Log entry created successfully'
    });

  } catch (error) {
    console.error('POST /logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create log entry',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// GET /logs/test/getLogs - Test route to get all logs (Admin only)
router.get("/test/getLogs", requireAdmin, async (req, res) => {
  let connection;
  
  try {
    connection = await connectToDatabase();
    const [rows] = await connection.query("SELECT * FROM logger ORDER BY timestamp DESC");
    
    res.status(200).json({ 
      success: true,
      message: "Logs retrieved successfully", 
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Test getLogs error:', error);
    
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error", 
      error: error.message 
    });
  } finally {
    if (connection && connection.release) {
      connection.release();
    }
  }
});

export default router;

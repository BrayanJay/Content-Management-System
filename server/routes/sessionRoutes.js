import express from 'express';
import { connectToDatabase } from '../lib/db.js';
import verifySessionToken from '../middleware/authToken.js';

const router = express.Router();

// Get active users count and details
router.get('/active', verifySessionToken, async (req, res) => {
  let db;
  try {
    db = await connectToDatabase();
    
    // Get users who have logged in within the last 3 hours (session timeout)
    const [activeUsers] = await db.query(`
      SELECT 
        id,
        username,
        role,
        last_login,
        TIMESTAMPDIFF(MINUTE, last_login, NOW()) as minutes_since_login
      FROM users 
      WHERE last_login > DATE_SUB(NOW(), INTERVAL 3 HOUR)
      AND token IS NOT NULL
      ORDER BY last_login DESC
    `);
    
    // Get total user count
    const [totalUsers] = await db.query('SELECT COUNT(*) as total FROM users');
    
    // Get users by role
    const [roleStats] = await db.query(`
      SELECT 
        role,
        COUNT(*) as count
      FROM users 
      GROUP BY role
      ORDER BY count DESC
    `);
    
    res.json({
      activeUsers: activeUsers.length,
      totalUsers: totalUsers[0].total,
      users: activeUsers,
      roleDistribution: roleStats,
      serverTime: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (db) db.release();
  }
});

// Get current user session info
router.get('/session', verifySessionToken, async (req, res) => {
  let db;
  try {
    db = await connectToDatabase();
    
    const [user] = await db.query(
      'SELECT id, username, role, last_login, created_at FROM users WHERE id = ?',
      [req.session.userId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: user[0],
      session: {
        userId: req.session.userId,
        username: req.session.username,
        role: req.session.userRole,
        sessionId: req.sessionID,
        loginTime: req.session.cookie.originalMaxAge,
        expires: req.session.cookie.expires || 'Session'
      }
    });
    
  } catch (error) {
    console.error('Error fetching session info:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (db) db.release();
  }
});

// Force logout a specific user (admin only)
router.post('/force-logout/:userId', verifySessionToken, async (req, res) => {
  // Check if current user is admin
  if (req.session.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  const { userId } = req.params;
  let db;
  
  try {
    db = await connectToDatabase();
    
    // Clear the user's token
    await db.query('UPDATE users SET token = NULL WHERE id = ?', [userId]);
    
    res.json({ message: 'User logged out successfully' });
    
  } catch (error) {
    console.error('Error forcing logout:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (db) db.release();
  }
});

export default router;

import { connectToDatabase } from '../lib/db.js'
import 'dotenv/config'

// VERIFY TOKEN middleware
const verifySessionToken = async (req, res, next) => {
    console.log("Session data in authToken middleware:", req.session);
    
    if (!req.session || !req.session.userId || !req.session.token) {
        console.log("Session validation failed:", {
            hasSession: !!req.session,
            hasUserId: !!req.session?.userId,
            hasToken: !!req.session?.token
        });
        return res.status(401).json({ message: 'Unauthorized: Session not found' })
    }

    let db;
    try {
        db = await connectToDatabase()
        const [rows] = await db.query('SELECT token FROM users WHERE id = ?', [req.session.userId])
        if (rows.length === 0 || rows[0].token !== req.session.token) {
            console.log("Token validation failed for userId:", req.session.userId);
            return res.status(401).json({ message: 'Unauthorized: Invalid session token' })
        }

        // ✅ Attach userId to request object
        req.userId = req.session.userId;
        console.log("Successfully attached userId to request:", req.userId);

        next()
    } catch (err) {
        console.error("Database error in authToken middleware:", err);
        return res.status(500).json({ message: "Server error" })
    } finally {
        if (db) db.release()
    }
}

export default verifySessionToken
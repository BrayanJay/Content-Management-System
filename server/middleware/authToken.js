import { connectToDatabase } from '../lib/db.js'
import 'dotenv/config'

// VERIFY TOKEN middleware
const verifySessionToken = async (req, res, next) => {
    if (!req.session || !req.session.userId || !req.session.token) {
        return res.status(401).json({ message: 'Unauthorized: Session not found' })
    }

    let db;
    try {
        db = await connectToDatabase()
        const [rows] = await db.query('SELECT token FROM users WHERE id = ?', [req.session.userId])
        if (rows.length === 0 || rows[0].token !== req.session.token) {
            return res.status(401).json({ message: 'Unauthorized: Invalid session token' })
        }

        // ✅ Attach userId to request object
        req.userId = req.session.userId;

        next()
    } catch (err) {
        return res.status(500).json({ message: "Server error" })
    } finally {
        if (db) db.release()
    }
}

export default verifySessionToken
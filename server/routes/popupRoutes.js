// import express from "express";
// import {connectToDatabase} from '../lib/db.js'
// import 'dotenv/config';
// import verifyToken from '../middleware/authToken.js';

// const router = express.Router();

// let popupEnabled = true; // Default state

// // Get the current popup state
// router.get("/popup-state", (req, res) => {
//     res.json({ popupEnabled });
// });

// // Update the popup state
// router.post("/popup-state", (req, res) => {
//     const { enabled } = req.body;
//     if (typeof enabled !== "boolean") {
//         return res.status(400).json({ error: "Invalid value. Must be a boolean." });
//     }
//     popupEnabled = enabled;
//     res.json({ message: "Popup state updated", popupEnabled });
// });

// export default router;


import express from "express";
import { connectToDatabase } from '../lib/db.js';
import 'dotenv/config';
import verifySessionToken from '../middleware/authToken.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the current popup state from DB
router.get("/popup-state", async (req, res) => {
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query("SELECT popup_enabled FROM settings LIMIT 1");
        const popupEnabled = rows.length > 0 ? !!rows[0].popup_enabled : false;
        res.json({ popupEnabled });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch popup state" });
    }
});

// Update the popup state in DB
router.post("/popup-state", verifySessionToken, async (req, res) => {
    const { enabled } = req.body;
    if (typeof enabled !== "boolean") {
        return res.status(400).json({ error: "Invalid value. Must be a boolean." });
    }
    try {
        const db = await connectToDatabase();
        await db.query("UPDATE settings SET popup_enabled = ? LIMIT 1", [enabled]);
        res.json({ message: "Popup state updated", popupEnabled: enabled });
    } catch (err) {
        res.status(500).json({ error: "Failed to update popup state" });
    }
});

router.get('/test-popup-status', (req, res) => {
    const imagePath = path.join(__dirname, '..', '..', 'media', 'uploads', 'popup.webp');

    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.json({ exists: false });
        } else {
            return res.json({ exists: true });
        }
    });
});

export default router;
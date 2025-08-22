import express from "express";
import {connectToDatabase} from '../lib/db.js'
import verifySessionToken from '../middleware/authToken.js';
import 'dotenv/config';

const router = express.Router();

// Get all branch data
router.get("/branches/all", async (req, res) => {
  let db;
  try {
    db = await connectToDatabase();

    const [branches] = await db.query("SELECT * FROM branch_data ORDER BY id ASC");

    if (branches.length === 0) {
      return res.status(404).json({ message: "No branches found." });
    }

    res.json(branches);

  } catch (e) {
    console.error("Error fetching all branches:", e.message);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) await db.release();
  }
});

// Get branches by language (for language-specific display)
router.get("/branches/lang/:lang", async (req, res) => {
  const { lang } = req.params;

  if (!['en', 'si', 'ta'].includes(lang)) {
    return res.status(400).json({ message: "Invalid language. Use 'en', 'si', or 'ta'." });
  }

  let db;
  try {
    db = await connectToDatabase();

    const query = `
      SELECT 
        id,
        region_id,
        branch_name_en,
        branch_name_${lang} as branch_name,
        branch_address_${lang} as branch_address,
        region_name_${lang} as region_name,
        contact_number,
        email,
        coordinates_longitude,
        coordinates_latitude,
        last_updated_time,
        last_updated_by
      FROM branch_data 
      ORDER BY id ASC
    `;

    const [branches] = await db.query(query);

    if (branches.length === 0) {
      return res.status(404).json({ message: "No branches found." });
    }

    res.json(branches);

  } catch (e) {
    console.error("Error fetching branches by language:", e.message);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) await db.release();
  }
});

// Get branches by region
router.get("/branches/region/:region_id", async (req, res) => {
  const { region_id } = req.params;

  let db;
  try {
    db = await connectToDatabase();

    const [branches] = await db.query("SELECT * FROM branch_data WHERE region_id = ? ORDER BY id ASC", [region_id]);

    if (branches.length === 0) {
      return res.status(404).json({ message: "No branches found for this region." });
    }

    res.json(branches);

  } catch (e) {
    console.error("Error fetching branches by region:", e.message);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) await db.release();
  }
});

// Get single branch by ID
router.get("/branches/details/:id", async (req, res) => {
  const { id } = req.params;

  let db;
  try {
    db = await connectToDatabase();

    const [branch] = await db.query("SELECT * FROM branch_data WHERE id = ?", [id]);

    if (branch.length === 0) {
      return res.status(404).json({ message: "Branch not found." });
    }

    res.json(branch[0]);

  } catch (e) {
    console.error("Error fetching branch details:", e.message);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) await db.release();
  }
});

// Get region statistics
router.get("/branches/stats/regions", async (req, res) => {
  let db;
  try {
    db = await connectToDatabase();

    const [stats] = await db.query(`
      SELECT 
        region_id,
        region_name_en,
        COUNT(*) as branch_count
      FROM branch_data 
      GROUP BY region_id, region_name_en
      ORDER BY region_id ASC
    `);

    res.json(stats);

  } catch (e) {
    console.error("Error fetching region statistics:", e.message);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) await db.release();
  }
});

// Add new branch (Protected route)
router.post("/branches/add", verifySessionToken, async (req, res) => {
  const { 
    region_id,
    branch_name_en,
    branch_name_si,
    branch_name_ta,
    branch_address_en,
    branch_address_si,
    branch_address_ta,
    region_name_en,
    region_name_si,
    region_name_ta,
    contact_number,
    email,
    coordinates_longitude,
    coordinates_latitude
  } = req.body;

  // Validation
  if (!region_id || !branch_name_en || !branch_name_si || !branch_name_ta || 
      !branch_address_en || !branch_address_si || !branch_address_ta ||
      !region_name_en || !region_name_si || !region_name_ta ||
      !contact_number || !email || !coordinates_longitude || !coordinates_latitude) {
    return res.status(400).json({ message: "All fields are required" });
  }

  let db;
  try {
    db = await connectToDatabase();

    const last_updated_by = req.user?.username || req.user?.email || 'System';

    const [result] = await db.query(`
      INSERT INTO branch_data (
        region_id, branch_name_en, branch_name_si, branch_name_ta,
        branch_address_en, branch_address_si, branch_address_ta,
        region_name_en, region_name_si, region_name_ta,
        contact_number, email, coordinates_longitude, coordinates_latitude,
        last_updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      region_id, branch_name_en, branch_name_si, branch_name_ta,
      branch_address_en, branch_address_si, branch_address_ta,
      region_name_en, region_name_si, region_name_ta,
      contact_number, email, coordinates_longitude, coordinates_latitude,
      last_updated_by
    ]);

    res.status(201).json({ 
      message: "Branch added successfully", 
      id: result.insertId 
    });

  } catch (e) {
    console.error("Error adding new branch:", e.message);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) await db.release();
  }
});

// Update branch (Protected route)
router.put("/branches/update/:id", verifySessionToken, async (req, res) => {
  const { id } = req.params;
  const { 
    region_id,
    branch_name_en,
    branch_name_si,
    branch_name_ta,
    branch_address_en,
    branch_address_si,
    branch_address_ta,
    region_name_en,
    region_name_si,
    region_name_ta,
    contact_number,
    email,
    coordinates_longitude,
    coordinates_latitude
  } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Branch ID is required" });
  }

  let db;
  try {
    db = await connectToDatabase();

    const last_updated_by = req.user?.username || req.user?.email || 'System';

    // Check if branch exists
    const [existing] = await db.query("SELECT id FROM branch_data WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Branch not found" });
    }

    const [result] = await db.query(`
      UPDATE branch_data SET 
        region_id = ?, branch_name_en = ?, branch_name_si = ?, branch_name_ta = ?,
        branch_address_en = ?, branch_address_si = ?, branch_address_ta = ?,
        region_name_en = ?, region_name_si = ?, region_name_ta = ?,
        contact_number = ?, email = ?, coordinates_longitude = ?, coordinates_latitude = ?,
        last_updated_by = ?
      WHERE id = ?
    `, [
      region_id, branch_name_en, branch_name_si, branch_name_ta,
      branch_address_en, branch_address_si, branch_address_ta,
      region_name_en, region_name_si, region_name_ta,
      contact_number, email, coordinates_longitude, coordinates_latitude,
      last_updated_by, id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Fetch updated branch
    const [updated] = await db.query("SELECT * FROM branch_data WHERE id = ?", [id]);
    res.json(updated[0]);

  } catch (e) {
    console.error("Error updating branch:", e.message);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) await db.release();
  }
});

// Delete branch (Protected route)
router.delete("/branches/delete/:id", verifySessionToken, async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Branch ID is required" });
  }

  let db;
  try {
    db = await connectToDatabase();

    // Check if branch exists
    const [existing] = await db.query("SELECT id, branch_name_en FROM branch_data WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Branch not found" });
    }

    const [result] = await db.query("DELETE FROM branch_data WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.json({ message: "Branch deleted successfully" });

  } catch (e) {
    console.error("Error deleting branch:", e.message);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) await db.release();
  }
});

export default router;
import express from "express";
import {connectToDatabase} from '../lib/db.js'
import 'dotenv/config';
import verifySessionToken from '../middleware/authToken.js';

const router = express.Router();

// Get All Profiles
router.get('/read/profile/:id', async (req, res) => {
  const { id } = req.params;

  let db;
  try {
    db = await connectToDatabase();

    const [rows] = await db.query("SELECT * FROM profile_content WHERE profile_id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    // Parse JSON descriptions back to arrays
    const parsedRows = rows.map(row => {
      let description = [];
      try {
        description = row.description ? JSON.parse(row.description) : [];
      } catch (e) {
        console.error("Error parsing JSON description:", e);
        // If JSON parsing fails, convert to array format
        description = row.description ? [row.description] : [];
      }

      return {
        ...row,
        description
      };
    });

    res.json(parsedRows);
  } catch (error) {
    console.error("Error fetching table:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) db.release(); // ✅ Always release the connection
  }
});

// Get Profile by ID & Language
router.get("/profiles/:id/:lang", async (req, res) => {
  const { id, lang } = req.params;

  let db;
  try {
    db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM profile_content WHERE profile_id = ? AND lang = ?", [id, lang]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Parse JSON description back to array
    let description = [];
    try {
      description = rows[0].description ? JSON.parse(rows[0].description) : [];
    } catch (e) {
      console.error("Error parsing JSON description:", e);
      // If JSON parsing fails, convert to array format
      description = rows[0].description ? [rows[0].description] : [];
    }

    const profile = {
      ...rows[0],
      description
    };

    res.json(profile);

  } catch (e) {
    console.error("Error fetching profile data:", e.message);
    res.status(500).json({ message: "Internal Server Error" });

  } finally {
    if (db) db.release();
  }
});

// Update Profile
router.put('/updateProfile/:id', verifySessionToken, async (req, res) => {
  const { id } = req.params;
  const { profile_name, designation, description, lang } = req.body;

  // Validate lang parameter
  const validLanguages = ['en', 'si', 'ta']; // Ensure these are the allowed languages
  if (!validLanguages.includes(lang)) {
    return res.status(400).json({ message: "Invalid language code" });
  }

  let db;
  try {

    // Connect to DB
    db = await connectToDatabase();

    // Capture real time
    const uploadedAt = new Date();

    // Retrieve admin username
    const [userRows] = await db.query("SELECT username FROM users WHERE id = ?", [req.userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const uploadedBy = userRows[0].username;

    await db.query(`
    UPDATE profile_content 
    SET profile_name = ?, designation = ?, description = ?, updated_at = ?, uploaded_by = ? 
    WHERE profile_id = ? AND lang = ?`, 
    [profile_name, designation, JSON.stringify(description), uploadedAt, uploadedBy, id, lang]
  );
    
    return res.status(201).json({ message: "Content updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) db.release(); // Always release the connection
  }
});

// Delete a Profile
router.delete("/deleteProfile", verifySessionToken, async (req, res) => {
  const { id, type } = req.body;
  let db;
  try {
    db = await connectToDatabase();
    let rows;

    if (type === 'bod') {
    [rows] = await db.query("DELETE FROM board_of_directors WHERE id = ?", [id]);
    } else {
      [rows] = await db.query("DELETE FROM corporate_management WHERE id = ?", [id]);
    }

    if (rows.affectedRows === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ message: "Profile deleted successfully" });

  } catch (e) {
    console.error("Error deleting profile data:", e.message);
    res.status(500).json({ message: "Internal Server Error" });

  } finally {
    if (db) db.release();
  }
});

//Get Profiles - BOD
router.get('/getProfiles/bod', async (req, res) => {

  let db;
  try {
    db = await connectToDatabase();

    const [rows] = await db.query("SELECT * FROM board_of_directors");

    if (rows.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    // Parse JSON descriptions back to arrays
    const parsedRows = rows.map(row => {
      let description_en = [];
      let description_si = [];
      let description_ta = [];

      try {
        description_en = row.description_en ? JSON.parse(row.description_en) : [];
        description_si = row.description_si ? JSON.parse(row.description_si) : [];
        description_ta = row.description_ta ? JSON.parse(row.description_ta) : [];
      } catch (e) {
        console.error("Error parsing JSON descriptions:", e);
        // If JSON parsing fails, convert to array format
        description_en = row.description_en ? [row.description_en] : [];
        description_si = row.description_si ? [row.description_si] : [];
        description_ta = row.description_ta ? [row.description_ta] : [];
      }

      return {
        ...row,
        description_en,
        description_si,
        description_ta
      };
    });

    res.json(parsedRows);
  } catch (error) {
    console.error("Error fetching table:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) db.release(); // ✅ Always release the connection
  }
});

//Get Profiles - BOD
router.get('/getProfiles/coop', async (req, res) => {

  let db;
  try {
    db = await connectToDatabase();

    const [rows] = await db.query("SELECT * FROM corporate_management");

    if (rows.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    // Parse JSON descriptions back to arrays
    const parsedRows = rows.map(row => {
      let description_en = [];
      let description_si = [];
      let description_ta = [];

      try {
        description_en = row.description_en ? JSON.parse(row.description_en) : [];
        description_si = row.description_si ? JSON.parse(row.description_si) : [];
        description_ta = row.description_ta ? JSON.parse(row.description_ta) : [];
      } catch (e) {
        console.error("Error parsing JSON descriptions:", e);
        // If JSON parsing fails, convert to array format
        description_en = row.description_en ? [row.description_en] : [];
        description_si = row.description_si ? [row.description_si] : [];
        description_ta = row.description_ta ? [row.description_ta] : [];
      }

      return {
        ...row,
        description_en,
        description_si,
        description_ta
      };
    });

    res.json(parsedRows);
  } catch (error) {
    console.error("Error fetching table:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) db.release(); // ✅ Always release the connection
  }
});

// Add a New Profile
router.post("/addProfile", verifySessionToken, async (req, res) => {
  const { type, nameEn, nameSi, nameTa, designationEn, designationSi, designationTa, descriptionEn, descriptionSi, descriptionTa } = req.body;
  
  console.log("Received profile data:", {
    type, nameEn, nameSi, nameTa, designationEn, designationSi, designationTa,
    descriptionEn: Array.isArray(descriptionEn) ? descriptionEn : "Not an array",
    descriptionSi: Array.isArray(descriptionSi) ? descriptionSi : "Not an array", 
    descriptionTa: Array.isArray(descriptionTa) ? descriptionTa : "Not an array"
  });

  let db;
  try {
    db = await connectToDatabase();

    // Get the last profile_id and increment it
    const [lastProfile] = await db.query("SELECT MAX(id) AS last_id FROM board_of_directors");
    const newProfileId = (lastProfile[0].last_id || 0) + 1;

    // Retrieve admin username
    const [userRows] = await db.query("SELECT username FROM users WHERE id = ?", [req.userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const uploadedBy = userRows[0].username;

    let rows;
    if (type === "bod") {
      [rows] = await db.query(
        "INSERT INTO board_of_directors (id, name_en, name_si, name_ta, designation_en, designation_si, designation_ta, description_en, description_si, description_ta, updated_at, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)",
        [newProfileId, nameEn, nameSi, nameTa, designationEn, designationSi, designationTa, JSON.stringify(descriptionEn), JSON.stringify(descriptionSi), JSON.stringify(descriptionTa), uploadedBy]
      );
    }
    else {
      [rows] = await db.query(
        "INSERT INTO corporate_management (id, name_en, name_si, name_ta, designation_en, designation_si, designation_ta, description_en, description_si, description_ta, updated_at, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)",
        [newProfileId, nameEn, nameSi, nameTa, designationEn, designationSi, designationTa, JSON.stringify(descriptionEn), JSON.stringify(descriptionSi), JSON.stringify(descriptionTa), uploadedBy]
      );
    }

    if (rows.affectedRows === 0) {
      return res.status(400).json({ message: "Profile creation failed!" });
    }

    res.json({ message: "Profile added successfully", newProfileId });

  } catch (e) {
    console.error("Error adding new profile data:", e.message);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) db.release();
  }
});

// Update Profile
router.put('/updateProfile', verifySessionToken, async (req, res) => {

  const { id, lang, type, name, designation, description } = req.body;

  let db;
  try {

    // Connect to DB
    db = await connectToDatabase();

    // Capture real time
    const uploadedAt = new Date();

    // Retrieve admin username
    const [userRows] = await db.query("SELECT username FROM users WHERE id = ?", [req.userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const uploadedBy = userRows[0].username;

    // Update the profile content
    if (type === 'bod') {
      if (lang === 'en') {
        await db.query(`
        UPDATE board_of_directors 
        SET name_en = ?, designation_en = ?, description_en = ?, updated_at = ?, uploaded_by = ? 
        WHERE id = ?`, 
        [name, designation, JSON.stringify(description), uploadedAt, uploadedBy, id]
      );
      } else if (lang === 'si') {
        await db.query(`
        UPDATE board_of_directors 
        SET name_si = ?, designation_si = ?, description_si = ?, updated_at = ?, uploaded_by = ? 
        WHERE id = ?`, 
        [name, designation, JSON.stringify(description), uploadedAt, uploadedBy, id]
      );
      } else if (lang === 'ta') {
        await db.query(`
        UPDATE board_of_directors 
        SET name_ta = ?, designation_ta = ?, description_ta = ?, updated_at = ?, uploaded_by = ? 
        WHERE id = ?`, 
        [name, designation, JSON.stringify(description), uploadedAt, uploadedBy, id]
      );
      }
    } else {
      if (lang === 'en') {
        await db.query(`
        UPDATE corporate_management 
        SET name_en = ?, designation_en = ?, description_en = ?, updated_at = ?, uploaded_by = ? 
        WHERE id = ?`, 
        [name, designation, JSON.stringify(description), uploadedAt, uploadedBy, id]
      );
      } else if (lang === 'si') {
        await db.query(`
        UPDATE corporate_management 
        SET name_si = ?, designation_si = ?, description_si = ?, updated_at = ?, uploaded_by = ? 
        WHERE id = ?`, 
        [name, designation, JSON.stringify(description), uploadedAt, uploadedBy, id]
      );
      } else if (lang === 'ta') {
        await db.query(`
        UPDATE corporate_management 
        SET name_ta = ?, designation_ta = ?, description_ta = ?, updated_at = ?, uploaded_by = ? 
        WHERE id = ?`, 
        [name, designation, JSON.stringify(description), uploadedAt, uploadedBy, id]
      );
      }
    }
    
    return res.status(201).json({ message: "Content updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) db.release(); // Always release the connection
  }
});



// ------------------------------------------ Test Routes ------------------------------------------ //


export default router;
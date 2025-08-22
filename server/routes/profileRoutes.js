import express from "express";
import {connectToDatabase} from '../lib/db.js'
import 'dotenv/config';
import verifySessionToken from '../middleware/authToken.js';
import { deleteFile } from '../utils/fileHandler.js';

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

// Delete a Profile
router.delete("/deleteProfile", verifySessionToken, async (req, res) => {
  const { id, type } = req.body;
  
  // Validate input
  if (!id || !type) {
    return res.status(400).json({ message: "Profile ID and type are required" });
  }
  
  if (type !== 'bod' && type !== 'coop') {
    return res.status(400).json({ message: "Invalid profile type. Must be 'bod' or 'coop'" });
  }

  let db;
  try {
    db = await connectToDatabase();
    let rows;
    let profileData;

    // First, get the profile data to determine the image file path
    if (type === 'bod') {
      [profileData] = await db.query("SELECT * FROM board_of_directors WHERE id = ?", [id]);
      if (profileData.length === 0) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Delete the profile from database
      [rows] = await db.query("DELETE FROM board_of_directors WHERE id = ?", [id]);
    } else {
      [profileData] = await db.query("SELECT * FROM corporate_management WHERE id = ?", [id]);
      if (profileData.length === 0) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Delete the profile from database
      [rows] = await db.query("DELETE FROM corporate_management WHERE id = ?", [id]);
    }

    if (rows.affectedRows === 0) {
      return res.status(404).json({ message: "Failed to delete profile from database" });
    }

    // Delete the associated image file
    const imageFileName = `${id}.webp`;
    const imagePath = `media/aboutPage/${type}/${imageFileName}`;
    
    console.log(`Attempting to delete image: ${imagePath}`);
    const imageDeleted = deleteFile(imagePath);
    
    if (imageDeleted) {
      console.log(`Successfully deleted profile image: ${imagePath}`);
    } else {
      console.log(`Profile image not found or could not be deleted: ${imagePath}`);
    }

    res.json({ 
      message: "Profile deleted successfully",
      profileId: id,
      profileType: type,
      imageDeleted: imageDeleted,
      deletedImagePath: imagePath
    });

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

//Get Profiles - COOP
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

  console.log("User ID from middleware:", req.userId);
  console.log("Session data:", req.session);

  let db;
  try {
    db = await connectToDatabase();

    let uploadedBy = "System"; // Default value

    // Try to get user information if userId is available
    if (req.userId) {
      try {
        const [userRows] = await db.query("SELECT username FROM users WHERE id = ?", [req.userId]);
        if (userRows.length > 0) {
          uploadedBy = userRows[0].username;
        } else {
          console.warn("User not found in database, using default uploadedBy");
        }
      } catch (userError) {
        console.warn("Error retrieving user info, using default uploadedBy:", userError.message);
      }
    } else {
      console.warn("No userId in request, using default uploadedBy");
    }

    console.log("uploadedBy value:", uploadedBy);

    let rows;
    let lastProfile;
    let newProfileId;
    
    if (type === "bod") {
      // Get the last profile_id and increment it
      [lastProfile] = await db.query("SELECT MAX(id) AS last_id FROM board_of_directors");
      newProfileId = (lastProfile[0].last_id || 0) + 1;

      [rows] = await db.query(
        "INSERT INTO board_of_directors (id, profile_picture, name_en, name_si, name_ta, designation_en, designation_si, designation_ta, description_en, description_si, description_ta, updated_at, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)",
        [newProfileId, newProfileId, nameEn, nameSi, nameTa, designationEn, designationSi, designationTa, JSON.stringify(descriptionEn), JSON.stringify(descriptionSi), JSON.stringify(descriptionTa), uploadedBy]
      );
    }
    else {

      // Get the last profile_id and increment it
      [lastProfile] = await db.query("SELECT MAX(id) AS last_id FROM corporate_management");
      newProfileId = (lastProfile[0].last_id || 0) + 1;

      [rows] = await db.query(
        "INSERT INTO corporate_management (id, profile_picture, name_en, name_si, name_ta, designation_en, designation_si, designation_ta, description_en, description_si, description_ta, updated_at, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)",
        [newProfileId, newProfileId, nameEn, nameSi, nameTa, designationEn, designationSi, designationTa, JSON.stringify(descriptionEn), JSON.stringify(descriptionSi), JSON.stringify(descriptionTa), uploadedBy]
      );
    }

    if (rows.affectedRows === 0) {
      return res.status(400).json({ message: "Profile creation failed!" });
    }

    res.json({ 
      message: "Profile added successfully", 
      profileId: newProfileId,
      id: newProfileId,
      data: { id: newProfileId }
    });

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
  
  const profilePicture = id;
  let db;
  try {

    // Connect to DB
    db = await connectToDatabase();

    // Capture real time
    const uploadedAt = new Date();

    let uploadedBy = "System"; // Default value

    // Try to get user information if userId is available
    if (req.userId) {
      try {
        const [userRows] = await db.query("SELECT username FROM users WHERE id = ?", [req.userId]);
        if (userRows.length > 0) {
          uploadedBy = userRows[0].username;
        } else {
          console.warn("User not found in database during profile update, using default uploadedBy");
        }
      } catch (userError) {
        console.warn("Error retrieving user info during profile update, using default uploadedBy:", userError.message);
      }
    } else {
      console.warn("No userId in request during profile update, using default uploadedBy");
    }

    // Update the profile content
    if (type === 'bod') {
      if (lang === 'en') {
        await db.query(`
        UPDATE board_of_directors 
        SET name_en = ?, designation_en = ?, description_en = ?, profile_picture = ?, updated_at = ?, uploaded_by = ? 
        WHERE id = ?`, 
        [name, designation, JSON.stringify(description), profilePicture, uploadedAt, uploadedBy, id]
      );
      } else if (lang === 'si') {
        await db.query(`
        UPDATE board_of_directors 
        SET name_si = ?, designation_si = ?, description_si = ?, profile_picture = ?, updated_at = ?, uploaded_by = ? 
        WHERE id = ?`, 
        [name, designation, JSON.stringify(description), profilePicture, uploadedAt, uploadedBy, id]
      );
      } else if (lang === 'ta') {
        await db.query(`
        UPDATE board_of_directors 
        SET name_ta = ?, designation_ta = ?, description_ta = ?, profile_picture = ?, updated_at = ?, uploaded_by = ? 
        WHERE id = ?`, 
        [name, designation, JSON.stringify(description), profilePicture, uploadedAt, uploadedBy, id]
      );
      }
    } else {
      if (lang === 'en') {
        await db.query(`
        UPDATE corporate_management 
        SET name_en = ?, designation_en = ?, description_en = ?, profile_picture = ?, updated_at = ?, uploaded_by = ? 
        WHERE id = ?`, 
        [name, designation, JSON.stringify(description), profilePicture, uploadedAt, uploadedBy, id]
      );
      } else if (lang === 'si') {
        await db.query(`
        UPDATE corporate_management 
        SET name_si = ?, designation_si = ?, description_si = ?, profile_picture = ?, updated_at = ?, uploaded_by = ? 
        WHERE id = ?`, 
        [name, designation, JSON.stringify(description), profilePicture, uploadedAt, uploadedBy, id]
      );
      } else if (lang === 'ta') {
        await db.query(`
        UPDATE corporate_management 
        SET name_ta = ?, designation_ta = ?, description_ta = ?, profile_picture = ?, updated_at = ?, uploaded_by = ? 
        WHERE id = ?`, 
        [name, designation, JSON.stringify(description), profilePicture, uploadedAt, uploadedBy, id]
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
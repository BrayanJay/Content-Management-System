import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {connectToDatabase} from '../lib/db.js'
import 'dotenv/config';
import verifySessionToken from '../middleware/authToken.js';

const router = express.Router();

// List of valid products
const allowedProducts = ['gold_loan', 'fixed_deposits', 'mortgage', 'leasing', 'luckewallet', 'forex'];

// Use memory storage with file size limits
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

// Upload Image API
router.post("/upload", verifySessionToken, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  let db; // Declare db connection variable
  try {
    const { originalname, mimetype, size, buffer } = req.file;
    const fileDirectory = req.body.file_directory || "media"; // Custom file directory or default: media
    const fileName = req.body.filename || originalname; // Custom filename or defualt: original filename
    const filePath = path.join(fileDirectory, fileName);
    const uploadedAt = new Date();

    //Sanitize file directory
    if (!fileDirectory.startsWith("media/")) {
      return res.status(400).json({ message: "Invalid directory path" });
    }

    // Ensure directory exists
    if (!fs.existsSync(fileDirectory)) {
      fs.mkdirSync(fileDirectory, { recursive: true });
    }

    // Write file manually
    fs.writeFileSync(filePath, buffer);

    // Connect to database
    db = await connectToDatabase();

    // Retrieve admin username
    const [userRows] = await db.query("SELECT username FROM users WHERE id = ?", [req.userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const uploadedBy = userRows[0].username;

    // Insert or update record in MySQL
    const query = `
      INSERT INTO file_uploads (old_file_name, new_file_name, file_type, file_size, file_directory, uploaded_timedate, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE uploaded_timedate = ?, file_size = ?;
    `;

    await db.query(query, [
      originalname, fileName, mimetype, size, fileDirectory, uploadedAt, uploadedBy,
      uploadedAt, size
    ]);

    return res.status(201).json({ message: "File uploaded successfully", file: { fileName, fileDirectory } });
  } catch (err) {
    return res.status(500).json({ message: err.message });

  } finally {
    if (db) db.release(); // ✅ Always release the connection
  }
});

// GET all files in a directory
router.get("/getFiles", async (req, res) => {
  try {
    const folder = req.query.folder || "media/attachments";
    const absolutePath = path.resolve(folder);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "Directory not found" });
    }

    const files = fs.readdirSync(absolutePath);
    const fileDetails = files.map(file => {
      const filePath = path.join(absolutePath, file);
      const stats = fs.statSync(filePath);
      return {
        fileName: file,
        path: `${folder}/${file}`,
        updatedAt: stats.mtime
      };
    });

    res.status(200).json(fileDetails);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a file
router.delete("/delete-file", verifySessionToken, async (req, res) => {
  const filePath = req.body.path;
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    fs.unlinkSync(filePath);
    return res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Delete Image API
router.delete("/delete/:filename", verifySessionToken, async (req, res) => {
  const { filename } = req.params;
  const fileDirectory = req.body.file_directory || "media";
  const filePath = path.join(fileDirectory, filename);

  let db;
  try {
    db = await connectToDatabase();
  
    // Check if file exists in database
    const [rows] = await db.query("SELECT * FROM file_uploads WHERE new_file_name = ? AND file_directory = ?", [filename, fileDirectory]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "File not found in database" });
    }
  
    // Delete file from system
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      return res.status(404).json({ message: "File not found in storage" });
    }
  
    // Remove database record
    await db.query("DELETE FROM file_uploads WHERE new_file_name = ? AND file_directory = ?", [filename, fileDirectory]);
  
    return res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// ------------------------------- TEST APIs ------------------------------------------ //

// GET toggle state
router.get('/getPopup', async (req, res) => {

  let db;
  try {
    db = await connectToDatabase();
    const [result] = await db.query('SELECT status FROM popup_status WHERE id = 1');
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT toggle state
router.put('/updatePopup', verifySessionToken, async (req, res) => {
  const { status } = req.body;
  console.log("Received PUT request with:", { status });
  
  if (typeof status !== 'boolean') {
  return res.status(400).json({ error: 'Invalid input' });
  }

  let db;
  try {
    db = await connectToDatabase();

    const [userRows] = await db.query("SELECT username FROM users WHERE id = ?", [req.userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const updated_by = userRows[0].username;
    
    await db.query(
      'UPDATE popup_status SET status = ?, updated_by = ? WHERE id = 1',
      [status, updated_by]
    );
    
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});


// ------------------------------- WEBSITE APIs ------------------------------------------ //

// Fetch Product Pages' Contents to the Website

router.get("/product/:product_name/:lang", async (req, res) => {
  const { product_name, lang } = req.params;

  if (!allowedProducts.includes(product_name)) {
    return res.status(400).json({ message: "Invalid product name" });
  }

  let db;
  try {
    db = await connectToDatabase();

    const [rows] = await db.query(
        "SELECT * FROM ?? WHERE lang = ?",
        [product_name, lang]
    );

    if (rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) db.release(); // ✅ Always release the connection
  }
});

//Fetch Personal Profiles' Contents to Website
router.get('/read/profile/:lang', async (req, res) => {
  const { lang } = req.params;

  let db;
  try {
    db = await connectToDatabase();

    // Query 1: Get all profiles
    const [profiles] = await db.query(`SELECT id, profile_picture FROM personal_profile`);

    if (!profiles.length) {
      return res.status(404).json({ message: "No profiles found" });
    }

    // Query 2: Get all profile content matching the language
    const [profileContents] = await db.query(
      `SELECT profile_id, profile_name, designation, description, lang 
       FROM profile_content 
       WHERE lang = ?`, 
      [lang]
    );

    if (!profileContents.length) {
      return res.status(404).json({ message: "No profile content found for the specified language" });
    }

    // Merge profiles with their content
    const finalProfiles = profiles.map(profile => {
      const content = profileContents.find(p => p.profile_id === profile.id);
      return content ? { ...profile, ...content } : null;
    }).filter(profile => profile !== null);

    res.json(finalProfiles);

  } catch (e) {
    console.error("Error fetching profile data:", e.message);
    res.status(500).json({ message: "Internal Server Error" });

  } finally {
    if (db) db.release(); // ✅ Ensure connection is released
  }
});

router.post('/read/profiles', async (req, res) => {
  const { ids, lang } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Invalid profile IDs" });
  }

  let db;
  try {
    db = await connectToDatabase();

    // Query 1: Get profile pictures
    const [profiles] = await db.query(
      `SELECT id, profile_picture FROM personal_profile WHERE id IN (?)`, 
      [ids]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ message: "Profiles not found" });
    }

    // Query 2: Get profile content
    const [profileContents] = await db.query(
      `SELECT profile_id, profile_name, designation, description, lang 
       FROM profile_content 
       WHERE profile_id IN (?) AND lang = ?`, 
      [ids, lang]
    );

    // Merge the results
    const finalProfiles = profiles.map(profile => {
      const content = profileContents.find(p => p.profile_id === profile.id);
      return content ? { ...profile, ...content } : null;
    }).filter(profile => profile !== null);

    res.json(finalProfiles);

  } catch (error) {
    console.error("Error fetching profiles:", error.message);
    res.status(500).json({ message: "Internal Server Error" });

  } finally {
    if (db) db.release();
  }
});

router.get('/read/profile/:id/:lang', async (req, res) => {
  const { id, lang } = req.params;

  let db;
  try {
    db = await connectToDatabase();

    // Query 1: Get profile picture from personal_profile
    const [profile] = await db.query(
      `SELECT id, profile_picture FROM personal_profile WHERE id = ?`, 
      [id]
    );

    if (!profile.length) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Query 2: Get profile content from profile_content
    const [profileContent] = await db.query(
      `SELECT profile_name, designation, description, lang 
       FROM profile_content 
       WHERE profile_id = ? AND lang = ?`, 
      [id, lang]
    );

    if (!profileContent.length) {
      return res.status(404).json({ message: "Profile content not found for the specified language" });
    }

    // Combine results
    const finalProfile = {
      id: profile[0].id,
      profile_picture: profile[0].profile_picture,
      profile_name: profileContent[0].profile_name,
      designation: profileContent[0].designation,
      description: profileContent[0].description,
      lang: profileContent[0].lang
    };

    res.json(finalProfile);

  } catch (error) {
    console.error("Error fetching profile data:", error.message);
    res.status(500).json({ message: "Internal Server Error" });

  } finally {
    if (db) db.release(); // ✅ Ensure connection is released
  }
});




export default router;
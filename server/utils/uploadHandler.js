import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { connectToDatabase } from "../lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function handleFileUpload(req, res, baseDirectory) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  let db;
  try {
    const { originalname, mimetype, size, buffer } = req.file;
    const customFilename = req.body.filename || originalname;
    const uploadedAt = new Date();

    // Sanitize filename
    if (customFilename.includes("/") || customFilename.includes("\\")) {
      return res.status(400).json({ message: "Invalid filename" });
    }

    const safeFilename = path.basename(customFilename).replace(/[^a-zA-Z0-9._-]/g, "_");

    const directoryFromClient = req.body.directory;
    const effectiveDirectory = directoryFromClient || baseDirectory || "media/uploads";

    console.log("Upload Debug Info:");
    console.log("- directoryFromClient:", directoryFromClient);
    console.log("- baseDirectory:", baseDirectory);
    console.log("- effectiveDirectory:", effectiveDirectory);
    console.log("- customFilename:", customFilename);

    const absoluteBaseDir = path.resolve(__dirname, "..", effectiveDirectory);
    const filePath = path.join(absoluteBaseDir, safeFilename);

    if (!filePath.startsWith(absoluteBaseDir)) {
      return res.status(400).json({ message: "Invalid path resolution" });
    }

    // Create directory if it doesn't exist
    await fs.mkdir(absoluteBaseDir, { recursive: true });

    // Write file to disk
    await fs.writeFile(filePath, buffer);

    // Connect to DB
    db = await connectToDatabase();

    // Get userId from session (set by authMiddleware)
    const userId = req.session?.userId;
    let uploadedBy = "System"; // Default fallback
    
    if (userId) {
      try {
        const [userRows] = await db.query("SELECT username FROM users WHERE id = ?", [userId]);
        if (userRows.length > 0) {
          uploadedBy = userRows[0].username;
        } else {
          console.warn("User not found in database, using default uploadedBy");
        }
      } catch (userError) {
        console.warn("Error retrieving user info, using default uploadedBy:", userError.message);
      }
    } else {
      console.warn("No userId in session, using default uploadedBy");
    }

    const query = `
      INSERT INTO file_uploads 
        (old_file_name, new_file_name, file_type, file_size, file_directory, uploaded_timedate, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        uploaded_timedate = ?, 
        file_size = ?;
    `;

    await db.query(query, [
      originalname, safeFilename, mimetype, size, effectiveDirectory, uploadedAt, uploadedBy,
      uploadedAt, size
    ]);

    return res.status(201).json({
      message: "File uploaded successfully",
      file: { fileName: safeFilename, fileDirectory: effectiveDirectory }
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (db && typeof db.release === "function") db.release();
  }
}

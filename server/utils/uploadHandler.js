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

    const [userRows] = await db.query("SELECT username FROM users WHERE id = ?", [req.userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const uploadedBy = userRows[0].username;

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

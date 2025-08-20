import express from "express";
import multer from "multer";
import { handleFileUpload } from "../utils/uploadHandler.js";
import { requireAuth, requirePermission } from "../middleware/authMiddleware.js";

const router = express.Router();

const memoryStorage = multer.memoryStorage();
const limits = { fileSize: 5 * 1024 * 1024 }; // 5 MB

const documentUpload = multer({
  storage: memoryStorage,
  limits,
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only PDF or Word documents are allowed"));
  }
});

const imageUpload = multer({
  storage: memoryStorage,
  limits,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/webp"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only PNG or WebP images are allowed"));
  }
});

router.post(
  "/upload/document",
  requireAuth,
  requirePermission('files', 'upload'),
  documentUpload.single("file"),
  (req, res) => handleFileUpload(req, res, "media/documents")
);

router.post(
  "/upload/image",
  requireAuth,
  requirePermission('files', 'upload'),
  imageUpload.single("file"),
  (req, res) => handleFileUpload(req, res, null) // Allow full control via client directory parameter
);

export default router;

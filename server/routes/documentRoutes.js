import express from "express";
import {
  uploadDocument,
  softDeleteDocument,
  restoreDocument,
  listDocumentsInWorkspace,
  downloadDocument,
  previewDocument,
  updateDocumentMetadata,
  getDocumentMetadata,
} from "../controller/documentController.js";

import { auth } from "../Middleware/authMiddleware.js"; // Assuming you have auth middleware

const router = express.Router();

// Upload document
router.post("/upload", auth, uploadDocument);

// Soft delete document (move to recycle bin)
router.put("/:id/soft-delete", auth, softDeleteDocument);

// Restore document from recycle bin
router.put("/:id/restore", auth, restoreDocument);

// List documents in a workspace
router.get("/:workspaceId/documents", auth, listDocumentsInWorkspace);

// Download a document
router.get("/download/:id", auth, downloadDocument);

// Preview a document
router.get("/preview/:id", auth, previewDocument);

router.put("/documents/:id/metadata", updateDocumentMetadata);

router.get("/documents/:id/metadata", getDocumentMetadata);

export default router;

import express from "express";
import multer from "multer";
import {
  uploadDocument,
  downloadDocument,
  softDeleteDocument,
  previewDocument,
  listDocumentsInWorkspace,
  // listDocumentsInRecycleBin,
  restoreDocument,
  updateDocumentMetadata,
  updateDocumentTags,
  searchDocuments,
} from "../controller/documentController.js";
import { auth } from "../Middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", auth, upload.single("document"), uploadDocument);
router.put("/:id/soft-delete", auth, softDeleteDocument);
router.put("/:documentId/restore", auth, restoreDocument);
router.get("/:workspaceId/documents", auth, listDocumentsInWorkspace);
router.get("/download/:id", auth, downloadDocument);
router.get("/preview/:id", auth, previewDocument);
router.put("/:id/metadata", auth, updateDocumentMetadata);
router.put("/:id/tags", auth, updateDocumentTags);
// router.get("/:workspaceId/recycle-bin", auth, listDocumentsInRecycleBin);
router.get("/search", auth, searchDocuments);

export default router;

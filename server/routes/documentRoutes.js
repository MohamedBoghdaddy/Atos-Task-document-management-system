import express from "express";
import multer from "multer";
import {
  uploadDocument,
  downloadDocument,
  deleteDocument,
  previewDocument,
  listDocumentsInWorkspace,
} from "../controller/documentController.js";
import { auth } from "../Middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", auth, upload.single("document"), uploadDocument);
router.get("/download/:id", auth, downloadDocument);
router.delete("/:id", auth, deleteDocument); // Updated route to match client call
router.get("/preview/:id", auth, previewDocument);
router.get("/:workspaceId/documents", auth, listDocumentsInWorkspace); // Ensure this matches the client-side route

export default router;

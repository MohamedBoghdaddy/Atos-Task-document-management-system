import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Document from "../models/DocumentModel.js";

// Fix __dirname issue in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirectory = path.join(__dirname, "../uploads");

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// POST /api/documents/upload
export const uploadDocument = async (req, res) => {
  try {
    const file = req.file;
    const filePath = path.join(
      uploadDirectory,
      `${Date.now()}_${file.originalname}`
    );

    // Move the file to the desired directory
    fs.renameSync(file.path, filePath);

    const newDocument = new Document({
      name: file.originalname,
      type: file.mimetype,
      url: filePath,
      owner: req.user.id,
      workspace: req.body.workspaceId,
    });

    await newDocument.save();

    res.status(200).json({
      message: "Document uploaded successfully",
      document: newDocument,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ message: "Document upload failed", error });
  }
};

// GET /api/documents/download/:id
export const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document || document.deleted) {
      return res
        .status(404)
        .json({ message: "Document not found or has been deleted" });
    }

    // Add authorization check to ensure the user owns the document
    if (document.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          message: "You do not have permission to access this document",
        });
    }

    res.download(document.url, document.name);
  } catch (error) {
    console.error("Error downloading document:", error);
    res.status(500).json({ message: "Document download failed", error });
  }
};

// DELETE /api/documents/:id
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Add authorization check to ensure the user owns the document
    if (document.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          message: "You do not have permission to delete this document",
        });
    }

    document.deleted = true;
    await document.save();

    res.status(200).json({ message: "Document soft deleted successfully" });
  } catch (error) {
    console.error("Error soft deleting document:", error);
    res.status(500).json({ message: "Document deletion failed", error });
  }
};

// Handle document preview
export const previewDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document || document.deleted) {
      return res
        .status(404)
        .json({ message: "Document not found or has been deleted" });
    }

    if (document.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          message: "You do not have permission to preview this document",
        });
    }

    // Simulate preview (e.g., return base64 string or similar)
    const base64Data = fs.readFileSync(document.url, { encoding: "base64" });
    res.json({ base64: base64Data });
  } catch (error) {
    console.error("Error previewing document:", error);
    res.status(500).json({ message: "Document preview failed", error });
  }
};

// List documents in a workspace
export const listDocumentsInWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { sortBy = "createdAt", order = "asc", filter = {} } = req.query;

    const documents = await Document.find({
      workspace: workspaceId,
      deleted: false,
      ...filter,
    })
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .exec();

    res.json(documents);
  } catch (error) {
    console.error("Error listing documents:", error);
    res.status(500).json({ message: "Error listing documents", error });
  }
};

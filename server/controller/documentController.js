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
    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Define the new file path
    const filePath = path.join(
      uploadDirectory,
      `${Date.now()}_${file.originalname}`
    );

    // Move the file to the desired directory
    fs.renameSync(file.path, filePath);

    // Create a new document entry in the database
    const newDocument = new Document({
      name: file.originalname,
      type: file.mimetype,
      url: filePath, // Ensure filePath is saved
      owner: req.user.id,
      workspace: req.body.workspaceId,
    });

    await newDocument.save();

    return res.status(200).json({
      message: "Document uploaded successfully",
      document: newDocument,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return res.status(500).json({ message: "Document upload failed", error });
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

    // Ensure the user owns the document
    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You do not have permission to access this document",
      });
    }

    // Ensure the file still exists on the server
    if (!fs.existsSync(document.url)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    return res.download(document.url, document.name);
  } catch (error) {
    console.error("Error downloading document:", error);
    return res.status(500).json({ message: "Document download failed", error });
  }
};

// DELETE /api/documents/:id
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Ensure the user owns the document
    if (!document.owner || document.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You do not have permission to delete this document",
      });
    }

    // Perform soft deletion
    document.deleted = true;
    await document.save();

    return res
      .status(200)
      .json({ message: "Document soft deleted successfully" });
  } catch (error) {
    console.error("Error soft deleting document:", error);
    return res.status(500).json({ message: "Document deletion failed", error });
  }
};

// GET /api/documents/preview/:id
export const previewDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document || document.deleted) {
      return res
        .status(404)
        .json({ message: "Document not found or has been deleted" });
    }

    // Ensure the user owns the document
    if (!document.owner || document.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You do not have permission to preview this document",
      });
    }

    // Ensure the file still exists on the server
    if (!fs.existsSync(document.url)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // Read the file and return the base64 encoded string along with its MIME type
    const fileType = document.type;
    const base64Data = fs.readFileSync(document.url, { encoding: "base64" });

    return res.json({
      fileType,
      base64: base64Data,
    });
  } catch (error) {
    console.error("Error previewing document:", error);
    return res.status(500).json({ message: "Document preview failed", error });
  }
};
// GET /api/documents/:workspaceId/documents
export const listDocumentsInWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { sortBy = "createdAt", order = "asc", filter = {} } = req.query;

    // Fetch all non-deleted documents in the workspace
    const documents = await Document.find({
      workspace: workspaceId,
      deleted: false,
      ...filter,
    })
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .exec();

    return res.json(documents);
  } catch (error) {
    console.error("Error listing documents:", error);
    return res.status(500).json({ message: "Error listing documents", error });
  }
};

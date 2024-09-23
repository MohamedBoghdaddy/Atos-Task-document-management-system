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

// Soft delete with permission checks
export const softDeleteDocument = async (req, res) => {
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
      .json({
        message: "Document moved to recycle bin successfully",
        document,
      });
  } catch (error) {
    console.error("Error soft deleting document:", error);
    return res.status(500).json({ message: "Document deletion failed", error });
  }
};

// Restore document with permission checks
export const restoreDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Ensure the user owns the document
    if (!document.owner || document.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You do not have permission to restore this document",
      });
    }

    // Restore the document
    document.deleted = false;
    await document.save();

    return res
      .status(200)
      .json({ message: "Document restored successfully", document });
  } catch (error) {
    console.error("Error restoring document:", error);
    return res
      .status(500)
      .json({ message: "Document restoration failed", error });
  }
};


// GET /api/documents/:workspaceId/documents
export const listDocumentsInWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { sortBy = "createdAt", order = "asc", filter = {} } = req.query;

    // Fetch all documents in the workspace
    const documents = await Document.find({
      workspace: workspaceId,
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

// Preview document handler
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

    const fileType = document.type;
    const filePath = document.url;
    const fileName = document.name; // Define the fileName from the document's name field

    // Supported preview types (can be displayed inline)
    const supportedPreviewTypes = [
      "image/",
      "application/pdf",
      "video/",
      "audio/",
      "text/",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx support
    ];

    const isPreviewSupported = supportedPreviewTypes.some((type) =>
      fileType.startsWith(type)
    );

    if (!isPreviewSupported) {
      return res.status(200).json({
        message:
          "Preview not supported. Use the download link to view the document.",
        downloadUrl: `http://localhost:4000/api/documents/download/${req.params.id}`,
        isPreviewSupported,
      });
    }

    // For previewable files (including .docx), return base64 encoded data
    const base64Data = fs.readFileSync(filePath, { encoding: "base64" });

    return res.json({
      fileType,
      base64: base64Data,
      fileName, // Send the document name to the frontend
      isPreviewSupported, // Send isPreviewSupported status to the frontend
    });
  } catch (error) {
    console.error("Error previewing document:", error);
    return res.status(500).json({ message: "Document preview failed", error });
  }
};



export const updateDocumentMetadata = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(document);
  } catch (err) {
    res.status(500).json({ error: "Error updating metadata" });
  }
};

export const getDocumentMetadata = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    res.json(document);
  } catch (err) {
    res.status(500).json({ error: "Error fetching metadata" });
  }
};

export const updateDocumentTags = async (req, res) => {
  try {
    const { tags } = req.body;
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { tags },
      { new: true }
    );
    res.json(document);
  } catch (err) {
    res.status(500).json({ error: "Error updating tags" });
  }
};


// models/DocumentModel.js
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: { type: String, required: true },
  url: { type: String, required: true },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  deleted: { type: Boolean, default: false }, // Soft deletion flag
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Document = mongoose.model("Document", documentSchema);
export default Document;

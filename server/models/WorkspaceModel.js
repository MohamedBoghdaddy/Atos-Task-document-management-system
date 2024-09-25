// models/WorkspaceModel.js
import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  collaborators: [
    {
      collaboratorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: {
        type: String,
        enum: ["Viewer", "Editor", "Admin"],
        default: "Viewer",
      },
    },
  ],
});

const Workspace = mongoose.model("Workspace", workspaceSchema);
export default Workspace;

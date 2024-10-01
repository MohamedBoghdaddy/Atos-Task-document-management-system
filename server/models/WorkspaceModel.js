import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // User who created the workspace
  },
  collaborators: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: ["Viewer", "Editor", "Admin"],
        default: "Editor",
      },
    },
  ],
  public: {
    type: Boolean,
    default: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

const Workspace = mongoose.model("Workspace", workspaceSchema);
export default Workspace;

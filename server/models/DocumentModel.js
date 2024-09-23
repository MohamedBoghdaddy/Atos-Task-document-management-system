import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  version: {
    type: Number,
    default: 1,
  }, 
  previousVersions: [
   
    {
      versionNumber: Number,
      documentContent: String, 
      updatedAt: Date,
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  tags: [String],
  accessControl: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      permissions: { type: String, enum: ["read", "write", "admin"] },
    },
  ],
  deleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

documentSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    this.previousVersions.push({
      versionNumber: this.version,
      documentContent: this.content, // Track current content
      updatedAt: new Date(),
    });
    this.version += 1; // Increment the version number for new changes
  }
  next();
});

const Document = mongoose.model("Document", documentSchema);
export default Document;

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
  versions: [
    {
      versionNumber: Number,
      content: String,
      timestamp: Date,
      modifiedBy: String,
      metadata: String,
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
  if (this.isModified("url") || this.isModified("name")) {
    this.versions.push({
      versionNumber: this.version,
      content: this.url,
      timestamp: new Date(),
      modifiedBy: this.owner ? this.owner.toString() : "Unknown", // Use `owner`
    });
    this.version += 1;
  }
  next();
});

// Check if the model exists before defining it again
const Document =
  mongoose.models.Document || mongoose.model("Document", documentSchema);

export default Document;

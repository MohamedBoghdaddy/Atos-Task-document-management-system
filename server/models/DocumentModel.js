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
    // Track content changes, you can modify this to track other fields if necessary
    this.versions.push({
      versionNumber: this.version,
      content: this.url, // Assuming `url` represents the content you want to version
      timestamp: new Date(),
      modifiedBy: this.owner.toString(), // Track who modified it
    });
    this.version += 1; // Increment the version number for new changes
  }
  next();
});

const Document = mongoose.model("Document", documentSchema);
export default Document;

import Workspace from "../models/WorkspaceModel.js";
import mongoose from "mongoose";

// Create a new workspace
export const createWorkspace = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user._id; // Using req.user for authenticated user

  try {
    const existingWorkspace = await Workspace.findOne({ name });

    if (existingWorkspace) {
      return res
        .status(400)
        .json({ message: "A workspace with this name already exists." });
    }

    const newWorkspace = new Workspace({
      name,
      description,
      user: userId, 
    });

    await newWorkspace.save();
    res.status(201).json(newWorkspace);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Workspace name must be unique." });
    }
    console.error("Failed to create workspace:", error);
    res.status(500).json({ message: "Failed to create workspace", error });
  }
};

// Fetch a workspace by its ID
export const getWorkspaceById = async (req, res) => {
  const { id } = req.params;

  try {
    const workspace = await Workspace.findById(id)
      .populate("user", "username email") // Populate user details
      .populate("collaborators.user", "username email"); // Populate collaborators' details

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    res.status(200).json(workspace);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve workspace", error });
  }
};

// Fetch all workspaces owned or collaborated by the user
export const getWorkspacesByUser = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { user: req.user._id }, // Workspaces owned by the authenticated user
        { "collaborators.user": req.user._id }, // Workspaces where the user is a collaborator
      ],
      deleted: false, // Exclude deleted workspaces
    })
      .populate("user", "username email")
      .populate("collaborators.user", "username email");

    if (workspaces.length === 0) {
      return res.status(200).json({ message: "No workspaces found" });
    }

    res.status(200).json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve workspaces", error: error.message });
  }
};

// Fetch all public workspaces
export const getAllPublicWorkspaces = async (req, res) => {
  const searchQuery = req.query.q ? req.query.q.trim() : ""; // Extract and trim the search query

  try {
    const query = {
      public: true, // Only public workspaces
      deleted: false, // Exclude deleted workspaces
    };

    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const publicWorkspaces = await Workspace.find(query);

    if (publicWorkspaces.length === 0) {
      return res.status(404).json({ message: "No public workspaces found" });
    }

    res.status(200).json(publicWorkspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({ message: "Failed to fetch workspaces", error });
  }
};

// Update workspace details (only allowed for users who created the workspace)
export const updateWorkspace = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this workspace" });
    }

    workspace.name = name || workspace.name;
    workspace.description = description || workspace.description;

    workspace.lastModified = Date.now(); // Update last modified timestamp

    await workspace.save();
    res.status(200).json(workspace);
  } catch (error) {
    res.status(500).json({ message: "Failed to update workspace", error });
  }
};

// Soft delete a workspace
export const deleteWorkspace = async (req, res) => {
  const { id } = req.params;

  try {
    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You do not have permission to delete this workspace",
      });
    }

    workspace.deleted = true;
    await workspace.save();

    return res
      .status(200)
      .json({ message: "Workspace soft deleted successfully" });
  } catch (error) {
    console.error("Error soft deleting workspace:", error);
    return res
      .status(500)
      .json({ message: "Workspace deletion failed", error });
  }
};

// Add collaborator to a workspace
export const addCollaborator = async (req, res) => {
  const { workspaceId } = req.params;
  const { userId, role } = req.body; // Use userId and role

  try {
    if (!userId || !role) {
      return res
        .status(400)
        .json({ message: "Collaborator ID and role are required" });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const existingCollaborator = workspace.collaborators.find(
      (c) => c.user && c.user.toString() === userId
    );

    if (existingCollaborator) {
      return res.status(400).json({ message: "Collaborator already exists" });
    }

    workspace.collaborators.push({ user: userId, role });
    workspace.lastModified = Date.now(); // Update last modified timestamp

    await workspace.save();
    res.status(200).json({ message: "Collaborator added successfully" });
  } catch (error) {
    console.error("Error adding collaborator:", error);
    res.status(500).json({ message: "Failed to add collaborator" });
  }
};

// Fetch collaborators for a workspace
export const fetchCollaborators = async (req, res) => {
  const { workspaceId } = req.params;

  if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
    return res.status(400).json({ message: "Invalid workspace ID" });
  }

  try {
    const workspace = await Workspace.findById(workspaceId).populate(
      "collaborators.user",
      "username email"
    ); // Populate user details

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    res.status(200).json(workspace.collaborators);
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    res.status(500).json({ message: "Failed to fetch collaborators", error });
  }
};

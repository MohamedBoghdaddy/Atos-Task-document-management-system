import Workspace from "../models/WorkspaceModel.js";

// Create a new workspace
export const createWorkspace = async (req, res) => {
  const { name, description } = req.body;

  const userId = req.user._id;

  console.log(userId);

  try {
    const workspace = new Workspace({
      name,
      description,
      user: userId, // Associate the workspace with the logged-in user
    });

    await workspace.save();
    res.status(201).json(workspace);
  } catch (error) {
    if (error.code === 11000) {
      // Handle unique constraint violation
      return res.status(400).json({
        message: "Workspace name must be unique. The name is already taken.",
      });
    }
    res.status(500).json({ message: "Failed to create workspace", error });
  }
};

// Retrieve a by ID
export const getWorkspaceById = async (req, res) => {
  const { id } = req.params;

  try {
    const workspace = await Workspace.findById(id).populate("user");
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    res.status(200).json(workspace);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve workspace", error });
  }
};
// Retrieve workspaces by specific user ID (useful for admin functions)
export const getWorkspacesByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const workspaces = await Workspace.find({
      user: userId,
      deleted: false,
    });

    if (workspaces.length === 0) {
      return res
        .status(404)
        .json({ message: "No workspaces found for this user" });
    }

    res.status(200).json(workspaces);
  } catch (error) {
    console.error("Failed to fetch workspaces:", error);
    res.status(500).json({ message: "Failed to fetch workspaces", error });
  }
};


export const updateWorkspace = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this workspace" });
    }

    workspace.name = name || workspace.name;
    workspace.description = description || workspace.description;

    await workspace.save();
    res.status(200).json(workspace);
  } catch (error) {
    res.status(500).json({ message: "Failed to update workspace", error });
  }
};

// Retrieve all workspaces for the authenticated user
export const getAllWorkspaces = async (req, res) => {

  try {
    // Use req.user._id instead of expecting userId in params
    const workspaces = await Workspace.find({
      user: req.user._id,
      deleted: false,
    });

    if (workspaces.length === 0) {
      return res
        .status(404)
        .json({ message: "No workspaces found for this user" });
    }

    res.status(200).json(workspaces);
  } catch (error) {
    console.error("Failed to fetch workspaces:", error);
    res.status(500).json({ message: "Failed to fetch workspaces", error });
  }
};


export const deleteWorkspace = async (req, res) => {
  const { id } = req.params;

  try {
    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Ensure the user owns the workspace
    if (
      !workspace.user ||
      workspace.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You do not have permission to delete this workspace",
      });
    }

    // Perform a soft delete
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

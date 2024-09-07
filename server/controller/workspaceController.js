import Workspace from "../models/WorkspaceModel.js";

// Create a new workspace
export const createWorkspace = async (req, res) => {
  const { name, description } = req.body;

  // Ensure req.user is correctly set by the auth middleware
  const userId = req.user._id;

  console.log(userId)

  try {
    const workspace = new Workspace({
      name,
      description,
      user: userId, // Associate the workspace with the logged-in user
    });

    await workspace.save();
    res.status(201).json(workspace);
  } catch (error) {
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
export const getWorkspacesByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const workspaces = await Workspace.find({ user: userId });
    if (!workspaces) {
      return res
        .status(404)
        .json({ message: "No workspaces found for this user" });
    }
    res.status(200).json(workspaces);
  } catch (error) {
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

// Retrieve all workspaces
export const getAllWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ user: req.user._id });
    res.status(200).json(workspaces);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve workspaces", error });
  }
};



export const deleteWorkspace = async (req, res) => {
  const { id } = req.params;

  try {
    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this workspace" });
    }

    await workspace.remove();
    res.status(200).json({ message: "Workspace deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete workspace", error });
  }
};

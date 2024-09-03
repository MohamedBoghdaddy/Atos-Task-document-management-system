import Workspace from "../models/WorkspaceModel.js";

// Create a new workspace
export const createWorkspace = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id; // Assuming you have user info from auth middleware

  try {
    const workspace = new Workspace({
      name,
      description,
      user: userId,
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

import Workspace from "../models/WorkspaceModel.js";
import Document from "../models/DocumentModel.js";
import User from "../models/UserModel.js";

export const getAnalytics = async (req, res) => {
  try {
    const workspaceCount = await Workspace.countDocuments();

    const documentCount = await Document.countDocuments();

    const collaborators = await User.find({ role: "collaborator" }).select(
      "name email"
    );

    res.status(200).json({
      workspaces: workspaceCount,
      documents: documentCount,
      collaborators: collaborators.length,
      collaboratorDetails: collaborators,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Failed to fetch analytics data" });
  }
};

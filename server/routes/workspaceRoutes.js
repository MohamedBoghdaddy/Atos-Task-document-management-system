import express from "express";
import {
  createWorkspace,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  getAllPublicWorkspaces,
  getWorkspacesByUser,
  addCollaborator,
  fetchCollaborators,
} from "../controller/workspaceController.js";
import { auth } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/createWorkspace", auth, createWorkspace);
router.get("/getWorkspaceById", auth, getWorkspaceById);
router.put("/updateWorkspace", auth, updateWorkspace);
router.delete("/deleteWorkspace/:id", auth, deleteWorkspace);
router.get("/:userId", auth, getWorkspacesByUser);
router.post("/:workspaceId/add-collaborator", auth, addCollaborator);
router.get("/:workspaceId/collaborators", auth, fetchCollaborators);
router.get("/search", getAllPublicWorkspaces);

export default router;

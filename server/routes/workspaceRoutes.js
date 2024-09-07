import express from "express";
import {
  createWorkspace,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  getWorkspacesByUser,
} from "../controller/workspaceController.js";
import { auth } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/createWorkspace", auth, createWorkspace);
router.get("/getWorkspaceById", auth, getWorkspaceById);
router.put("/updateWorkspace", auth, updateWorkspace);
router.delete("/deleteWorkspace", auth, deleteWorkspace);
router.get("/getAllWorkspaces", auth, getAllWorkspaces);
router.get("/getWorkspacesByUser/:userId", auth, getWorkspacesByUser);

export default router;

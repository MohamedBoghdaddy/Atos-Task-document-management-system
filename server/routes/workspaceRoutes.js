import express from "express";
import {
  createWorkspace,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
} from "../controller/workspaceController.js";
import { auth } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(auth, createWorkspace); // This route is hit by "http://localhost:4000/api/workspaces"

router
  .route("/:id")
  .get(auth, getWorkspaceById) // This route is hit by "http://localhost:4000/api/workspaces/:id"
  .put(auth, updateWorkspace)
  .delete(auth, deleteWorkspace);

export default router;

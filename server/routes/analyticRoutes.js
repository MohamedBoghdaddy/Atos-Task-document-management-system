import express from "express";
import { getAnalytics } from "../controller/analyticsController.js";
const router = express.Router();

router.get("/analytics/:workspaceId", getAnalytics);

export default router;

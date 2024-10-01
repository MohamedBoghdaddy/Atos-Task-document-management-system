import express from "express";
import {
  register,
  login,
  logoutUser,
  getUser,
  updateUser,
  deleteUser,
  checkAuth,
  searchUsersByUsername,
  fetchCollaborators,
} from "../controller/usercontroller.js";
import { auth, authorizeRoles } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.post("/logout", logoutUser);

router.get("/getone/:userId", getUser);
router.put("/update/:userId", auth, updateUser);
router.delete("/:userId", auth, deleteUser);

router.get("/admin", auth, authorizeRoles("admin"), (req, res) => {
  res.status(200).json({ message: "Welcome, Admin!" });
});

router.get("/dashboard", auth, authorizeRoles("admin", "user"), (req, res) => {
  res.status(200).json({ message: "Welcome to the Dashboard" });
});

router.get("/checkAuth", auth, checkAuth);

router.get("/search", auth, searchUsersByUsername);

router.get("/:id/collaborators", auth, fetchCollaborators);


export default router;

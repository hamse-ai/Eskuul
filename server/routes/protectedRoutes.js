import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// Public route
router.get("/public", (req, res) => {
  res.json({ message: "This is a public route" });
});

// Protected route (requires login)
router.get("/profile", protect, (req, res) => {
  res.json({ message: `Welcome ${req.user.name}!`, user: req.user });
});

// Admin-only route
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Admin access granted", user: req.user });
});

// Student or Admin route
router.get("/progress", protect, authorize("student", "admin"), (req, res) => {
  res.json({ message: "Student or Admin access granted" });
});

export default router;

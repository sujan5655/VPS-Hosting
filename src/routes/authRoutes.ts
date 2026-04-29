import { Router } from "express";
import { registerUser, getAllUsers, loginUser } from "../controller/authController.js";
import { authenticateToken, requirePermission, requireRole } from "../middleware/rbac.js";

const router = Router();

// Register a new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Get all users (requires authentication and read:users permission)
router.get("/users", authenticateToken, requirePermission("users", "read"), getAllUsers);

// Example protected routes
router.get("/admin-only", authenticateToken, requireRole("admin"), (req, res) => {
  res.json({ message: "Admin access granted" });
});

router.get("/manage-users", authenticateToken, requirePermission("users", "manage"), (req, res) => {
  res.json({ message: "User management access granted" });
});

export default router;

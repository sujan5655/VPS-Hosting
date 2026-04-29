import { Router } from "express";
import { updateUserRole, getAllRoles } from "../controller/userController.js";
import { authenticateToken, requirePermission, requireRole } from "../middleware/rbac.js";

const router = Router();

// Get all available roles (requires authentication)
router.get("/roles", authenticateToken, getAllRoles);

// Update user role (requires manage:users permission)
router.put("/role", authenticateToken, requirePermission("users", "manage"), updateUserRole);

export default router;

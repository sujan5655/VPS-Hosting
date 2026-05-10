import { Router } from "express";
import { updateUserRole, getAllRoles, getAllUsers } from "../controller/userController.js";
import { assignRolesByName, addRolesToUser, removeRolesFromUser, getUserRoles } from "../controller/userRoleController.js";
import { authenticateToken, requirePermission, requireRole } from "../middleware/rbac.js";

const router = Router();

// Get all available roles (requires authentication)
router.get("/roles", authenticateToken, getAllRoles);

// Get all users with pagination and filtering (requires read:users permission)
router.get("/", authenticateToken, requirePermission("users", "read"), getAllUsers);

// Get specific user's roles (requires read:users permission)
router.get("/:userId/roles", authenticateToken, requirePermission("users", "read"), getUserRoles);

// Update user role (requires manage:users permission)
router.put("/role", authenticateToken, requirePermission("users", "manage"), updateUserRole);

// Assign roles by name (requires manage:users permission)
router.put("/assign-roles", authenticateToken, requirePermission("users", "manage"), assignRolesByName);

// Add additional roles to user (requires manage:users permission)
router.post("/add-roles", authenticateToken, requirePermission("users", "manage"), addRolesToUser);

// Remove roles from user (requires manage:users permission)
router.delete("/remove-roles", authenticateToken, requirePermission("users", "manage"), removeRolesFromUser);

export default router;

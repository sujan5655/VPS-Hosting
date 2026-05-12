import { Router } from "express";
import { authenticateToken, requirePermission, requireRole } from "../middleware/rbac";
import { updateUserRole } from "../controller/userController";

const router=Router();
router.put("/role",authenticateToken,requireRole("admin"),requirePermission("users","manage"),updateUserRole);
export default router;
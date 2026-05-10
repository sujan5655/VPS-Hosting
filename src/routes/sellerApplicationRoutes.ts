import { Router } from "express";
import {
  submitSellerApplication,
  getAllSellerApplications,
  getSellerApplicationById,
  approveSellerApplication,
  rejectSellerApplication,
  getMySellerApplication
} from "../controller/sellerApplicationController.js";
import { authenticateToken, requirePermission } from "../middleware/rbac.js";

const router = Router();

// User routes
router.post("/", authenticateToken, submitSellerApplication);
router.get("/my-application", authenticateToken, getMySellerApplication);

// Admin & Manager routes (require manage:sellers permission)
router.get("/", authenticateToken, requirePermission("sellers", "manage"), getAllSellerApplications);
router.get("/:id", authenticateToken, requirePermission("sellers", "manage"), getSellerApplicationById);
router.put("/:id/approve", authenticateToken, requirePermission("sellers", "manage"), approveSellerApplication);
router.put("/:id/reject", authenticateToken, requirePermission("sellers", "manage"), rejectSellerApplication);

export default router;

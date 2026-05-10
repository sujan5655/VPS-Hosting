import express from "express";

import { authenticateToken } from "../middleware/rbac.js";
import { requirePermission } from "../middleware/rbac.js";

import {
  adminDashboard,
  sellerDashboard,
} from "../controller/dashboardController.js";

const router = express.Router();

// 👑 ADMIN
router.get(
  "/admin",
  authenticateToken,
  requirePermission("manage","users"),
  adminDashboard
);

// 🏪 SELLER
router.get(
  "/seller",
  authenticateToken,
  requirePermission("create","products"),
  sellerDashboard
);

export default router;
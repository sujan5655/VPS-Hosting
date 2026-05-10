import express from "express";

import { authenticateToken } from "../middleware/rbac.js";

import {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
} from "../controller/orderController.js";

const router = express.Router();

router.use(authenticateToken);

// 📦 checkout
router.post("/", createOrder);

// 👤 my orders
router.get("/my-orders", getMyOrders);

// 📦 single order
router.get("/:id", getOrder);

// 👑 admin/staff
router.patch("/:id/status", updateOrderStatus);

export default router;
import express from "express";
import { authenticateToken } from "../middleware/rbac.js";
import { requirePermission } from "../middleware/rbac.js";

import {
  createCategory,
  getCategories,
  getCategory,
  deleteCategory,
} from "../controller/categoryController.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategory);

router.post(
  "/",
  authenticateToken,
  createCategory
);

router.delete(
  "/:id",
  authenticateToken,
  requirePermission("delete", "categories"),
  deleteCategory
);

export default router;
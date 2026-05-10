
import { PERMISSIONS } from "../middleware/Permissions.js";
import { authenticateToken, requirePermission } from "../middleware/rbac.js";
import { upload } from "../middleware/upload.js";
import { Router } from "express";
import { Express } from "express";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controller/productController.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);

router.post(
  "/",
  authenticateToken,
  upload.array("images", 5),
  createProduct
);
router.patch(
  "/:id",
  authenticateToken,
  requirePermission("products","update"),
  upload.array("images", 5),
  updateProduct
);

router.delete(
  "/:id",
  authenticateToken,
  requirePermission("products","delete"),
  deleteProduct
);

export default router;
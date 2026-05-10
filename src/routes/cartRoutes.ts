import express from "express";


import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
} from "../controller/cartController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.post("/", addToCart);

router.get("/", getCart);

router.patch("/:id", updateCartItem);

router.delete("/:id", removeCartItem);

export default router;
import { Cart } from "../models/Cart.js";
import { CartItem } from "../models/CartItem.js";
import { Product } from "../models/ProductModel.js";

export const addToCart = async (req: any, res: any) => {
  try {

    const { productId, quantity, size } = req.body;

    const userId = req.user.id;

    // 🔍 product check
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // 📦 stock check
    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Not enough stock",
      });
    }

    // 🛒 get/create cart
    let cart = await Cart.findOne({
      where: { userId },
    });

    if (!cart) {
      cart = await Cart.create({ userId });
    }

    // 🔥 same product + same size
    let existingItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId,
        size: size || null,
      },
    });

    if (existingItem) {

      existingItem.quantity += quantity;

      await existingItem.save();

      return res.json({
        success: true,
        message: "Cart updated",
        data: existingItem,
      });
    }

    // ➕ new cart item
    const item = await CartItem.create({
      cartId: cart.id,
      productId,
      quantity,
      size,
      price: product.price,
    });

    res.status(201).json({
      success: true,
      data: item,
    });

  } catch (error) {
    res.status(500).json({
      message: "Add to cart failed",
      error,
    });
  }
};


export const getCart = async (req: any, res: any) => {
  try {

    const cart = await Cart.findOne({
      where: {
        userId: req.user.id,
      },
      include: [
        {
          model: CartItem,
          include: [Product],
        },
      ],
    });

    if (!cart) {
      return res.json({
        items: [],
        total: 0,
      });
    }

    // 💰 calculate total
    const total = cart.items.reduce(
      (sum: number, item: any) =>
        sum + item.price * item.quantity,
      0
    );

    res.json({
      success: true,
      total,
      items: cart.items,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to get cart",
      error,
    });
  }
};

export const updateCartItem = async (req: any, res: any) => {
  try {

    const item = await CartItem.findByPk(req.params.id, {
      include: [Cart],
    });

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // 🔐 ownership check
    if (item.cart.userId !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    item.quantity = req.body.quantity;

    await item.save();

    res.json(item);

  } catch (error) {
    res.status(500).json({
      message: "Update failed",
      error,
    });
  }
};

export const removeCartItem = async (req: any, res: any) => {

  const item = await CartItem.findByPk(req.params.id, {
    include: [Cart],
  });

  if (!item) {
    return res.status(404).json({
      message: "Item not found",
    });
  }

  // 🔐 ownership check
  if (item.cart.userId !== req.user.id) {
    return res.status(403).json({
      message: "Unauthorized",
    });
  }

  await item.destroy();

  res.json({
    success: true,
    message: "Item removed",
  });
};
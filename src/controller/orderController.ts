import { Cart } from "../models/Cart.js";
import { CartItem } from "../models/CartItem.js";
import { Product } from "../models/ProductModel.js";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";

export const createOrder = async (req: any, res: any) => {
  try {

    const userId = req.user.id;

    const { shippingAddress } = req.body;

    // 🛒 get cart
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          include: [Product],
        },
      ],
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // 💰 calculate total
    let total = 0;

    for (const item of cart.items) {

      // 🔥 latest stock validation
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `${item.product.name} out of stock`,
        });
      }

      total += item.price * item.quantity;
    }

    // 📦 create order
    const order = await Order.create({
      userId,
      totalAmount: total,
      shippingAddress,
    });

    // 📦 create order items
    for (const item of cart.items) {

      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
      });

      // 📉 reduce stock
      item.product.stock -= item.quantity;

      await item.product.save();
    }

    // 🗑️ clear cart
    await CartItem.destroy({
      where: {
        cartId: cart.id,
      },
    });

    res.status(201).json({
      success: true,
      data: order,
    });

  } catch (error) {
    res.status(500).json({
      message: "Checkout failed",
      error,
    });
  }
};



export const getMyOrders = async (req: any, res: any) => {

  const orders = await Order.findAll({
    where: {
      userId: req.user.id,
    },
    include: [
      {
        model: OrderItem,
        include: [Product],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.json(orders);
};


export const getOrder = async (req: any, res: any) => {

  const order = await Order.findByPk(req.params.id, {
    include: [
      {
        model: OrderItem,
        include: [Product],
      },
    ],
  });

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  // 🔐 ownership/admin check
  if (
    order.userId !== req.user.id
  ) {
    return res.status(403).json({
      message: "Unauthorized",
    });
  }

  res.json(order);
};



import { hasPermission } from "../utils/permission.js";

export const updateOrderStatus = async (req: any, res: any) => {

  const order = await Order.findByPk(req.params.id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  // 🔐 admin/staff check
  const allowed = await hasPermission(
    req.user.id,
    "manage:orders"
  );

  if (!allowed) {
    return res.status(403).json({
      message: "Unauthorized",
    });
  }

  order.status = req.body.status;

  await order.save();

  res.json(order);
};
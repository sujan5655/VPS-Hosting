import { User } from "../models/User.js";
import { Product } from "../models/ProductModel.js";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";

import { Op } from "sequelize";

export const adminDashboard = async (
  req: any,
  res: any
) => {

  try {

    // 👥 total users
    const totalUsers =
      await User.count();

    // 📦 total products
    const totalProducts =
      await Product.count();

    // 🛒 total orders
    const totalOrders =
      await Order.count();

    // 💰 total revenue
    const revenueResult =
      await Order.sum(
        "totalAmount",
        {
          where: {
            paymentStatus: "paid",
          },
        }
      );

    // 📦 pending orders
    const pendingOrders =
      await Order.count({
        where: {
          status: "pending",
        },
      });

    // 🔥 latest orders
    const latestOrders =
      await Order.findAll({
        limit: 10,
        order: [["createdAt", "DESC"]],
      });

    // ⚠️ low stock
    const lowStockProducts =
      await Product.findAll({
        where: {
          stock: {
            [Op.lt]: 5,
          },
        },
        limit: 10,
      });

    res.json({
      success: true,

      analytics: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue:
          revenueResult || 0,
        pendingOrders,
      },

      latestOrders,

      lowStockProducts,
    });

  } catch (error) {

    res.status(500).json({
      message:
        "Admin dashboard failed",
      error,
    });
  }
};
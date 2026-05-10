import { Product } from "../models/ProductModel.js";
import { OrderItem } from "../models/OrderItem.js";
import { Order } from "../models/Order.js";
import { Op } from "sequelize";

export const sellerDashboard = async (
  req: any,
  res: any
) => {

  try {

    const sellerId = req.user.id;

    // 📦 seller products
    const products =
      await Product.findAll({
        where: {
          userId: sellerId,
        },
      });

    const productIds =
      products.map(p => p.id);

    // 📦 seller order items
    const orderItems =
      await OrderItem.findAll({
        where: {
  productId: {
    [Op.in]: productIds
  }
},
        include: [Order],
      });

    // 💰 revenue
    let revenue = 0;

    orderItems.forEach((item: any) => {

      if (
        item.order.paymentStatus === "paid"
      ) {
        revenue +=
          item.price * item.quantity;
      }
    });

    // 🛒 total sold
    const totalSold =
      orderItems.reduce(
        (sum: number, item: any) =>
          sum + item.quantity,
        0
      );

    // ⚠️ low stock
    const lowStock =
      products.filter(
        (p: any) => p.stock < 5
      );

    res.json({
      success: true,

      analytics: {
        totalProducts:
          products.length,

        totalRevenue: revenue,

        totalSold,
      },

      lowStockProducts:
        lowStock,

      recentOrders:
        orderItems.slice(0, 10),
    });

  } catch (error) {

    res.status(500).json({
      message:
        "Seller dashboard failed",
      error,
    });
  }
};
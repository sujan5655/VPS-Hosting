import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { Permission } from "../models/Permission.js";
import { RolePermission } from "../models/RolePermission.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { UserRole } from "../models/UserRole.js";
import { SellerApplication } from "../models/SellerApplication.js";
import { Product } from "../models/ProductModel.js";
import { Category } from "../models/CategoryModel.js";
import { Cart } from "../models/Cart.js";
import { CartItem } from "../models/CartItem.js";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";

dotenv.config();


const sequelize = new Sequelize({
  database: process.env.DB_NAME || "ecommerce",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "1234",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  dialect: "postgres",
  logging: false,
  models: [User, Role, Permission, RolePermission, RefreshToken, UserRole, SellerApplication, Product, Category, Cart, CartItem, Order, OrderItem],
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    connectTimeout: 60000,
    socketTimeout: 60000
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected");
  } catch (err) {
    console.error(" DB error", err);
  }
};

export { sequelize, connectDB };
import { seedRBAC } from "../seed/rbacSeed.js";
import { createAdmin } from "./createAdmin.js";
import { sequelize } from "../config/database.js";
import { Role } from "../models/Role.js";
import { User } from "../models/User.js";
import { UserRole } from "../models/UserRole.js";
import { Product } from "../models/ProductModel.js";
import { Order } from "../models/Order.js";
import SellerApplication from "../models/SellerApplication.js";
import { Cart } from "../models/Cart.js";
import { CartItem } from "../models/CartItem.js";

async function setupProduction() {
  try {
    console.log("🚀 Starting production setup...");

    // 🔐 ENV SAFETY CHECK (VERY IMPORTANT)
    if (process.env.RUN_SETUP !== "true") {
      console.log("⚠️ RUN_SETUP is false. Skipping setup.");
      process.exit(0);
    }

    // 🔌 DB connection check
    await sequelize.authenticate();
    console.log("✅ Database connected");
 

    // 🔥 FIX HERE
    await sequelize.sync({ force: false }); // Wait for all tables to be created
    console.log("📦 Database synced");
    
    // Small delay to ensure tables are fully created
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 🧠 Step 1: RBAC seed (idempotent inside seedRBAC)
    console.log("📋 Seeding RBAC...");
    await seedRBAC();
    console.log("✅ RBAC seeded");

    // 👤 Step 2: Admin creation (must be idempotent too)
    console.log("👤 Creating admin...");
    await createAdmin();
    console.log("✅ Admin ready");

    console.log("\n🎉 Production setup completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

setupProduction();
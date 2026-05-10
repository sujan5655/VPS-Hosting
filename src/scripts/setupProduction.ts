import { seedRBAC } from "../seed/rbacSeed.js";
import { createAdmin } from "./createAdmin.js";
import { sequelize } from "../config/database.js";

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
    await sequelize.sync(); // or replace with migrations
    console.log("📦 Database synced");
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
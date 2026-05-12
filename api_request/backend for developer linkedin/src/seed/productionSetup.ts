import { config as dotenvConfig } from "dotenv";
dotenvConfig();

import { seedRBAC } from "./rbacSeed";
import { createAdmin } from "./createAdmin";
import { sequelize } from "../config/database";

async function setupProduction() {
  try {
    console.log("🚀 Starting production setup...");
    console.log(`🔍 RUN_SETUP value: "${process.env.RUN_SETUP}"`);

    // 🔐 ENV SAFETY CHECK (VERY IMPORTANT)
    if (process.env.RUN_SETUP !== "true") {
      console.log("⚠️ RUN_SETUP is false. Skipping setup.");
      console.log("💡 To enable setup, set RUN_SETUP=true in your environment variables");
      process.exit(0);
    }

    // 🔌 DB connection check
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // 🧠 Step 1: RBAC seed (idempotent inside seedRBAC)
    console.log("📋 Seeding RBAC...");
    await seedRBAC();
    console.log("✅ RBAC seeded");

    // 👤 Step 2: Admin creation (must be idempotent too)
    console.log("👤 Creating admin...");
    const adminCreated = await createAdmin();
    if (!adminCreated) {
      throw new Error("Admin creation failed");
    }
    console.log("✅ Admin ready");

    console.log("\n🎉 Production setup completed successfully!");
    console.log("🌐 Your admin user is ready to login");
    console.log(`📧 Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  setupProduction();
}

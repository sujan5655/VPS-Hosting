import { seedRBAC } from "../seed/rbacSeed.js";
import { createAdmin } from "./createAdmin.js";

async function setupProduction() {
  try {
    console.log("🚀 Starting production setup...");

    // Step 1: Seed roles & permissions
    console.log("📋 Step 1: Setting up roles and permissions...");
    await seedRBAC();
    console.log("✅ Roles and permissions created");

    // Step 2: Create first admin
    console.log("👤 Step 2: Creating first admin user...");
    await createAdmin();
    console.log("✅ Admin user created");

    console.log("\n🎉 Production setup completed successfully!");
    console.log("🔐 You can now login with your admin credentials");
    process.exit(0);
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

setupProduction();

import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function syncAdminUser() {
  try {
    console.log("🔄 Syncing admin user with .env credentials...");

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;

    if (!adminEmail || !adminPassword) {
      console.error("❌ ADMIN_EMAIL or ADMIN_PASSWORD not found in .env");
      process.exit(1);
    }

    // Find existing admin user
    const existingAdmin = await User.findOne({
      where: {
        email: adminEmail
      }
    });

    if (existingAdmin) {
      console.log(`✅ Found existing admin user: ${adminEmail}`);
      
      // Update the existing admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await existingAdmin.update({
        password: hashedPassword,
        name: adminName || existingAdmin.name,
        role: 'admin'
      });
      
      console.log(`✅ Updated admin user credentials`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Name: ${adminName || existingAdmin.name}`);
      console.log(`   Password: Updated successfully`);
      
    } else {
      console.log(`❌ No admin user found with email: ${adminEmail}`);
      
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const newAdmin = await User.create({
        email: adminEmail,
        password: hashedPassword,
        name: adminName || "System Administrator",
        role: 'admin'
      });
      
      console.log(`✅ Created new admin user`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Name: ${adminName || "System Administrator"}`);
      console.log(`   Role: admin`);
    }

    console.log("🎉 Admin user sync completed successfully!");
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Error syncing admin user:", error);
    process.exit(1);
  }
}

syncAdminUser();

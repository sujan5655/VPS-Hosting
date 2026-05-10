import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { sequelize } from "../config/database.js";

dotenv.config();

async function syncAdminUser() {
  try {
    console.log("🔄 Syncing admin user with .env credentials...");

    // Initialize database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;

    if (!adminEmail || !adminPassword) {
      console.error("❌ ADMIN_EMAIL or ADMIN_PASSWORD not found in .env");
      process.exit(1);
    }

    // Find existing admin user (try both old and new email)
    let existingAdmin = await User.findOne({
      where: {
        email: adminEmail
      }
    });

    // If not found with new email, try with old email patterns
    if (!existingAdmin) {
      const possibleOldEmails = [
        adminEmail.charAt(0).toUpperCase() + adminEmail.slice(1), // First letter uppercase
        adminEmail.toLowerCase(),
        adminEmail.toUpperCase()
      ];
      
      for (const oldEmail of possibleOldEmails) {
        existingAdmin = await User.findOne({
          where: { email: oldEmail }
        });
        if (existingAdmin) {
          console.log(`✅ Found admin user with old email: ${oldEmail}`);
          break;
        }
      }
    }

    if (existingAdmin) {
      console.log(`✅ Found existing admin user: ${existingAdmin.email}`);
      
      // Update the existing admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await existingAdmin.update({
        email: adminEmail, // Update email to match .env
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

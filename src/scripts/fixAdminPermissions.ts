import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { UserRole } from "../models/UserRole.js";
import { Permission } from "../models/Permission.js";
import { RolePermission } from "../models/RolePermission.js";
import { sequelize } from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

async function fixAdminPermissions() {
  try {
    console.log("🔧 Fixing admin user permissions...");

    // Initialize database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.error("❌ ADMIN_EMAIL not found in .env");
      process.exit(1);
    }

    // Find admin user
    const adminUser = await User.findOne({
      where: { email: adminEmail }
    });

    if (!adminUser) {
      console.error(`❌ Admin user not found: ${adminEmail}`);
      process.exit(1);
    }

    console.log(`✅ Found admin user: ${adminUser.email}`);

    // Find admin role
    const adminRole = await Role.findOne({
      where: { name: 'admin' }
    });

    if (!adminRole) {
      console.error("❌ Admin role not found");
      process.exit(1);
    }

    console.log(`✅ Found admin role: ${adminRole.name}`);

    // Check if user has admin role
    const existingUserRole = await UserRole.findOne({
      where: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    });

    if (!existingUserRole) {
      // Assign admin role to user
      await UserRole.create({
        userId: adminUser.id,
        roleId: adminRole.id
      });
      console.log("✅ Assigned admin role to user");
    } else {
      console.log("✅ User already has admin role");
    }

    // Get all permissions
    const allPermissions = await Permission.findAll({
      where: { isActive: true }
    });

    console.log(`✅ Found ${allPermissions.length} active permissions`);

    // Assign all permissions to admin role
    for (const permission of allPermissions) {
      const existingRolePermission = await RolePermission.findOne({
        where: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      });

      if (!existingRolePermission) {
        await RolePermission.create({
          roleId: adminRole.id,
          permissionId: permission.id
        });
        console.log(`✅ Added permission: ${permission.name}`);
      }
    }

    console.log("🎉 Admin permissions fixed successfully!");
    console.log(`   User: ${adminUser.email}`);
    console.log(`   Role: ${adminRole.name}`);
    console.log(`   Permissions: All (${allPermissions.length} permissions)`);

    process.exit(0);

  } catch (error) {
    console.error("❌ Error fixing admin permissions:", error);
    process.exit(1);
  }
}

fixAdminPermissions();

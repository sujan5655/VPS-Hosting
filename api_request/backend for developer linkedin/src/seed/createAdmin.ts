import { config as dotenvConfig } from "dotenv";
dotenvConfig();

import { sequelize } from "../config/database";
import { User } from "../models/User";
import { Role } from "../models/Role";
import { UserRole } from "../models/UserRole";
import bcrypt from "bcrypt";

export const createAdmin = async () => {
  try {
    console.log('👤 Creating admin user...');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;

    console.log(`🔍 Environment check:`);
    console.log(`   ADMIN_EMAIL: ${adminEmail || 'missing'}`);
    console.log(`   ADMIN_PASSWORD: ${adminPassword ? 'exists' : 'missing'}`);
    console.log(`   ADMIN_NAME: ${adminName || 'missing'}`);

    if (!adminEmail || !adminPassword || !adminName) {
      console.log('❌ Admin credentials not found in environment variables');
      return false;
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return true;
    }

    // Get admin role
    const adminRole = await Role.findOne({
      where: { name: 'admin' }
    });

    if (!adminRole) {
      console.log('❌ Admin role not found. Please run rbacSeed first.');
      return false;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword
    });

    // Assign admin role
    await UserRole.findOrCreate({
      where: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    });

    console.log('✅ Admin user created successfully');
    console.log(`👤 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`🎭 Role: admin`);

    return true;

  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    return false;
  }
};

// Run the function if this file is executed directly
if (require.main === module) {
  createAdmin().then(success => {
    process.exit(success ? 0 : 1);
  });
}

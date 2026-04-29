import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { sequelize } from "../config/database.js";
import bcrypt from "bcrypt";

export const createAdmin = async () => {
  try {
    // Get admin role
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      throw new Error('Admin role not found - run seedRBAC first');
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      where: { email: process.env.ADMIN_EMAIL || 'admin@ecommerce.com' }
    });

    if (existingAdmin) {
      console.log("ℹ️ Admin user already exists, skipping creation");
      return existingAdmin;
    }

    // Validate admin credentials
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
    }

    // Hash password
    const saltRounds = 12; // Higher rounds for admin
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user
    const adminUser = await User.create({
      name: 'System Administrator',
      email: adminEmail,
      password: hashedPassword,
      roleId: adminRole.id
    });

    console.log(`✅ Admin user created: ${adminEmail}`);
    console.log(`🔑 Login with: ${adminEmail} / [your password]`);

    return adminUser;
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
};

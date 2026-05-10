import { Role } from "../models/Role.js";
import { Permission } from "../models/Permission.js";
import { RolePermission } from "../models/RolePermission.js";
import { User } from "../models/User.js";
import { UserRole } from "../models/UserRole.js";
import bcrypt from "bcrypt";



export const seedRBAC = async () => {
  try {
    console.log("🌱 Seeding RBAC...");

    // 1. Create Roles
    const rolesData = [
      { name: 'admin', description: 'System administrator with full access to all features', isActive: true },
      { name: 'manager', description: 'Store manager with oversight and reporting capabilities', isActive: true },
      { name: 'seller', description: 'Product seller who can manage their own products and orders', isActive: true },
      { name: 'staff', description: 'Store staff with order processing and customer service capabilities', isActive: true },
      { name: 'user', description: 'Regular customer with shopping and order management', isActive: true }
    ];

    const roles = await Role.bulkCreate(rolesData, { ignoreDuplicates: true });

    // Create role map ( optimization)
    const allRoles = await Role.findAll();
    const roleMap: { [key: string]: string } = {};
    allRoles.forEach(r => {
      roleMap[r.name] = r.id;
    });

    console.log(" Roles ready:", Object.keys(roleMap));

    // 2. Create Permissions
    const permissionsData = [
      // User Management
      { name: 'read:users', resource: 'users', action: 'read', isActive: true },
      { name: 'create:users', resource: 'users', action: 'create', isActive: true },
      { name: 'update:users', resource: 'users', action: 'update', isActive: true },
      { name: 'delete:users', resource: 'users', action: 'delete', isActive: true },
      { name: 'manage:users', resource: 'users', action: 'manage', isActive: true },

      // Products
      { name: 'read:products', resource: 'products', action: 'read', isActive: true },
      { name: 'create:products', resource: 'products', action: 'create', isActive: true },
      { name: 'update:products', resource: 'products', action: 'update', isActive: true },
      { name: 'delete:products', resource: 'products', action: 'delete', isActive: true },
      { name: 'manage:products', resource: 'products', action: 'manage', isActive: true },
      { name: 'manage:own-products', resource: 'products', action: 'manage-own', isActive: true },

      // Orders
      { name: 'read:orders', resource: 'orders', action: 'read', isActive: true },
      { name: 'create:orders', resource: 'orders', action: 'create', isActive: true },
      { name: 'update:orders', resource: 'orders', action: 'update', isActive: true },
      { name: 'delete:orders', resource: 'orders', action: 'delete', isActive: true },
      { name: 'manage:orders', resource: 'orders', action: 'manage', isActive: true },
      { name: 'process:orders', resource: 'orders', action: 'process', isActive: true },
      { name: 'read:own-orders', resource: 'orders', action: 'read-own', isActive: true },

      // Categories
      { name: 'read:categories', resource: 'categories', action: 'read', isActive: true },
      { name: 'create:categories', resource: 'categories', action: 'create', isActive: true },
      { name: 'update:categories', resource: 'categories', action: 'update', isActive: true },
      { name: 'delete:categories', resource: 'categories', action: 'delete', isActive: true },
      { name: 'manage:categories', resource: 'categories', action: 'manage', isActive: true },

      // Inventory
      { name: 'read:inventory', resource: 'inventory', action: 'read', isActive: true },
      { name: 'update:inventory', resource: 'inventory', action: 'update', isActive: true },
      { name: 'manage:inventory', resource: 'inventory', action: 'manage', isActive: true },

      // Analytics
      { name: 'read:analytics', resource: 'analytics', action: 'read', isActive: true },
      { name: 'read:reports', resource: 'reports', action: 'read', isActive: true },
      { name: 'manage:reports', resource: 'reports', action: 'manage', isActive: true },

      // Support
      { name: 'read:support-tickets', resource: 'support', action: 'read', isActive: true },
      { name: 'update:support-tickets', resource: 'support', action: 'update', isActive: true },
      { name: 'manage:support', resource: 'support', action: 'manage', isActive: true },

      // Payments
      { name: 'read:transactions', resource: 'payments', action: 'read', isActive: true },
      { name: 'process:refunds', resource: 'payments', action: 'refund', isActive: true },
      { name: 'manage:payments', resource: 'payments', action: 'manage', isActive: true },

      // Seller Management
      { name: 'read:sellers', resource: 'sellers', action: 'read', isActive: true },
      { name: 'manage:sellers', resource: 'sellers', action: 'manage', isActive: true },
      { name: 'approve:sellers', resource: 'sellers', action: 'approve', isActive: true },

      //Dashboard Access
      { 
  name: 'access:admin-dashboard',
  resource: 'dashboard',
  action: 'admin-access',
  isActive: true
},
{ 
  name: 'access:seller-dashboard',
  resource: 'dashboard',
  action: 'seller-access',
  isActive: true
},
    ];

    await Permission.bulkCreate(permissionsData, { ignoreDuplicates: true });

    const allPermissions = await Permission.findAll();

    // Create permission map ( optimization)
    const permissionMap: { [key: string]: string } = {};
    allPermissions.forEach(p => {
      permissionMap[p.name] = p.id;
    });

    console.log("✅ Permissions ready:", Object.keys(permissionMap).length);

    // Helper to assign permissions
    const assignPermissions = async (roleName: string, permissionNames: string[]) => {
      const roleId = roleMap[roleName];

     const rolePermissions = permissionNames
  .filter(name => permissionMap[name])
  .map((name: string) => ({
    roleId,
    permissionId: permissionMap[name]
  }));

      await RolePermission.bulkCreate(rolePermissions, { ignoreDuplicates: true });
    };

    // 3. Assign Permissions

    // Admin → ALL
    await assignPermissions('admin', Object.keys(permissionMap));



    // Manager
    await assignPermissions('manager', [
       'access:admin-dashboard',
  'access:seller-dashboard',
      'read:users','create:users','update:users',
      'read:products','create:products','update:products','delete:products',
      'read:orders','update:orders','manage:orders','process:orders',
      'read:categories','create:categories','update:categories','delete:categories',
      'read:inventory','update:inventory','manage:inventory',
      'read:analytics','read:reports','manage:reports',
      'read:support-tickets','update:support-tickets','manage:support',
      'read:transactions','process:refunds',
      'read:sellers','manage:sellers','approve:sellers'
    ]);
    

    // Seller
    await assignPermissions('seller', [
      'access:seller-dashboard',
      'read:products','create:products','update:products','delete:products',
      'manage:own-products','read:orders','read:own-orders','update:orders',
      'read:categories','read:inventory','read:analytics','read:reports',
      'read:support-tickets','update:support-tickets','read:transactions'
    ]);

    // Staff
    await assignPermissions('staff', [
      'read:products','read:orders','update:orders','process:orders',
      'read:categories','read:inventory','update:inventory',
      'read:support-tickets','update:support-tickets','manage:support',
      'read:transactions','process:refunds','read:analytics','read:reports'
    ]);

    // User
    await assignPermissions('user', [
      'read:products','create:orders','read:own-orders','update:orders',
      'read:categories','read:support-tickets','update:support-tickets'
    ]);

    // 4. Create Admin User from Environment Variables
    console.log("   Creating admin user...");

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    if (!adminEmail || !adminPassword) {
      console.warn("   Warning: ADMIN_EMAIL or ADMIN_PASSWORD not found in .env file");
      console.warn("   Admin user creation skipped. Please set these environment variables.");
    } else {
      // Hash admin password before storing
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
      
      // Create admin user
      const [adminUser, created] = await User.findOrCreate({
        where: { email: adminEmail },
        defaults: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword
        }
      });

      if (created) {
        console.log(`   Admin user created: ${adminEmail}`);
      } else {
        console.log(`   Admin user already exists: ${adminEmail}`);
      }

      // Assign admin role to the admin user
      const adminRoleId = roleMap['admin'];
      if (adminRoleId) {
        await UserRole.findOrCreate({
          where: { 
            userId: adminUser.id, 
            roleId: adminRoleId 
          },
          defaults: {
            userId: adminUser.id,
            roleId: adminRoleId
          }
        });
        console.log(`   Admin role assigned to user: ${adminEmail}`);
      }
    }
    console.log("   RBAC seeding completed successfully!");

  } catch (error) {
    console.error("❌ RBAC seeding failed:", error);
    throw error;
  }
};
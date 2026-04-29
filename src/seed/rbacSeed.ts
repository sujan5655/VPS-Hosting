import { Role } from "../models/Role.js";
import { Permission } from "../models/Permission.js";
import { RolePermission } from "../models/RolePermission.js";
import { sequelize } from "../config/database.js";

export const seedRBAC = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: false });

    // Create e-commerce roles
    const roles = await Role.bulkCreate([
      { name: 'admin', description: 'System administrator with full access to all features', isActive: true },
      { name: 'manager', description: 'Store manager with oversight and reporting capabilities', isActive: true },
      { name: 'seller', description: 'Product seller who can manage their own products and orders', isActive: true },
      { name: 'staff', description: 'Store staff with order processing and customer service capabilities', isActive: true },
      { name: 'user', description: 'Regular customer with shopping and order management', isActive: true }
    ], { ignoreDuplicates: true });

    console.log('Roles created:', roles.map(r => r.name));

    // Create comprehensive e-commerce permissions
    const permissions = await Permission.bulkCreate([
      // User Management permissions
      { name: 'read:users', description: 'View user information and profiles', resource: 'users', action: 'read', isActive: true },
      { name: 'create:users', description: 'Create new user accounts', resource: 'users', action: 'create', isActive: true },
      { name: 'update:users', description: 'Update user information', resource: 'users', action: 'update', isActive: true },
      { name: 'delete:users', description: 'Delete user accounts', resource: 'users', action: 'delete', isActive: true },
      { name: 'manage:users', description: 'Full user management access', resource: 'users', action: 'manage', isActive: true },
      
      // Product Management permissions
      { name: 'read:products', description: 'View product information', resource: 'products', action: 'read', isActive: true },
      { name: 'create:products', description: 'Add new products to catalog', resource: 'products', action: 'create', isActive: true },
      { name: 'update:products', description: 'Update product information', resource: 'products', action: 'update', isActive: true },
      { name: 'delete:products', description: 'Remove products from catalog', resource: 'products', action: 'delete', isActive: true },
      { name: 'manage:products', description: 'Full product management access', resource: 'products', action: 'manage', isActive: true },
      { name: 'manage:own-products', description: 'Manage own seller products only', resource: 'products', action: 'manage-own', isActive: true },
      
      // Order Management permissions
      { name: 'read:orders', description: 'View order information', resource: 'orders', action: 'read', isActive: true },
      { name: 'create:orders', description: 'Create new orders', resource: 'orders', action: 'create', isActive: true },
      { name: 'update:orders', description: 'Update order status and information', resource: 'orders', action: 'update', isActive: true },
      { name: 'delete:orders', description: 'Cancel or delete orders', resource: 'orders', action: 'delete', isActive: true },
      { name: 'manage:orders', description: 'Full order management access', resource: 'orders', action: 'manage', isActive: true },
      { name: 'process:orders', description: 'Process and fulfill orders', resource: 'orders', action: 'process', isActive: true },
      { name: 'read:own-orders', description: 'View own customer orders', resource: 'orders', action: 'read-own', isActive: true },
      
      // Category Management permissions
      { name: 'read:categories', description: 'View product categories', resource: 'categories', action: 'read', isActive: true },
      { name: 'create:categories', description: 'Create new product categories', resource: 'categories', action: 'create', isActive: true },
      { name: 'update:categories', description: 'Update category information', resource: 'categories', action: 'update', isActive: true },
      { name: 'delete:categories', description: 'Delete product categories', resource: 'categories', action: 'delete', isActive: true },
      { name: 'manage:categories', description: 'Full category management access', resource: 'categories', action: 'manage', isActive: true },
      
      // Inventory Management permissions
      { name: 'read:inventory', description: 'View inventory levels', resource: 'inventory', action: 'read', isActive: true },
      { name: 'update:inventory', description: 'Update inventory levels', resource: 'inventory', action: 'update', isActive: true },
      { name: 'manage:inventory', description: 'Full inventory management', resource: 'inventory', action: 'manage', isActive: true },
      
      // Analytics and Reporting permissions
      { name: 'read:analytics', description: 'View sales analytics and reports', resource: 'analytics', action: 'read', isActive: true },
      { name: 'read:reports', description: 'View business reports', resource: 'reports', action: 'read', isActive: true },
      { name: 'manage:reports', description: 'Generate and manage reports', resource: 'reports', action: 'manage', isActive: true },
      
      // Customer Service permissions
      { name: 'read:support-tickets', description: 'View customer support tickets', resource: 'support', action: 'read', isActive: true },
      { name: 'update:support-tickets', description: 'Update and resolve support tickets', resource: 'support', action: 'update', isActive: true },
      { name: 'manage:support', description: 'Full customer support management', resource: 'support', action: 'manage', isActive: true },
      
      // Payment and Financial permissions
      { name: 'read:transactions', description: 'View payment transactions', resource: 'payments', action: 'read', isActive: true },
      { name: 'process:refunds', description: 'Process customer refunds', resource: 'payments', action: 'refund', isActive: true },
      { name: 'manage:payments', description: 'Full payment management access', resource: 'payments', action: 'manage', isActive: true }
    ], { ignoreDuplicates: true });

    console.log('Permissions created:', permissions.length);

    // Get all roles and permissions
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    const managerRole = await Role.findOne({ where: { name: 'manager' } });
    const sellerRole = await Role.findOne({ where: { name: 'seller' } });
    const staffRole = await Role.findOne({ where: { name: 'staff' } });
    const userRole = await Role.findOne({ where: { name: 'user' } });

    if (!adminRole || !managerRole || !sellerRole || !staffRole || !userRole) {
      throw new Error('Roles not found');
    }

    // Assign ALL permissions to admin (full system access)
    const allPermissions = await Permission.findAll();
    const adminRolePermissions = allPermissions.map(permission => ({
      roleId: adminRole.id,
      permissionId: permission.id
    }));

    await RolePermission.bulkCreate(adminRolePermissions, { ignoreDuplicates: true });
    console.log('Admin permissions assigned (full access)');

    // Assign comprehensive permissions to manager (oversight and reporting)
    const managerPermissions = await Permission.findAll({
      where: {
        name: [
          'read:users', 'create:users', 'update:users',
          'read:products', 'create:products', 'update:products', 'delete:products',
          'read:orders', 'update:orders', 'manage:orders', 'process:orders',
          'read:categories', 'create:categories', 'update:categories', 'delete:categories',
          'read:inventory', 'update:inventory', 'manage:inventory',
          'read:analytics', 'read:reports', 'manage:reports',
          'read:support-tickets', 'update:support-tickets', 'manage:support',
          'read:transactions', 'process:refunds'
        ]
      }
    });

    const managerRolePermissions = managerPermissions.map(permission => ({
      roleId: managerRole.id,
      permissionId: permission.id
    }));

    await RolePermission.bulkCreate(managerRolePermissions, { ignoreDuplicates: true });
    console.log('Manager permissions assigned (oversight and reporting)');

    // Assign seller-specific permissions (manage own products and orders)
    const sellerPermissions = await Permission.findAll({
      where: {
        name: [
          'read:products', 'create:products', 'update:products', 'delete:products',
          'manage:own-products', 'read:orders', 'read:own-orders', 'update:orders',
          'read:categories', 'read:inventory', 'read:analytics', 'read:reports',
          'read:support-tickets', 'update:support-tickets', 'read:transactions'
        ]
      }
    });

    const sellerRolePermissions = sellerPermissions.map(permission => ({
      roleId: sellerRole.id,
      permissionId: permission.id
    }));

    await RolePermission.bulkCreate(sellerRolePermissions, { ignoreDuplicates: true });
    console.log('Seller permissions assigned (product and order management)');

    // Assign staff permissions (order processing and customer service)
    const staffPermissions = await Permission.findAll({
      where: {
        name: [
          'read:products', 'read:orders', 'update:orders', 'process:orders',
          'read:categories', 'read:inventory', 'update:inventory',
          'read:support-tickets', 'update:support-tickets', 'manage:support',
          'read:transactions', 'process:refunds', 'read:analytics', 'read:reports'
        ]
      }
    });

    const staffRolePermissions = staffPermissions.map(permission => ({
      roleId: staffRole.id,
      permissionId: permission.id
    }));

    await RolePermission.bulkCreate(staffRolePermissions, { ignoreDuplicates: true });
    console.log('Staff permissions assigned (order processing and support)');

    // Assign basic customer permissions to user role
    const userPermissions = await Permission.findAll({
      where: {
        name: [
          'read:products', 'create:orders', 'read:own-orders', 'update:orders',
          'read:categories', 'read:support-tickets', 'update:support-tickets'
        ]
      }
    });

    const userRolePermissions = userPermissions.map(permission => ({
      roleId: userRole.id,
      permissionId: permission.id
    }));

    await RolePermission.bulkCreate(userRolePermissions, { ignoreDuplicates: true });
    console.log('User permissions assigned (customer shopping)');

    console.log('RBAC seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding RBAC:', error);
    throw error;
  }
};

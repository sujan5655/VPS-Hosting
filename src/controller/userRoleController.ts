import { Request, Response } from "express";
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { UserRole } from "../models/UserRole.js";

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Assign multiple roles to a user
 */
export const assignRolesToUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, roleIds } = req.body;

    if (!userId || !Array.isArray(roleIds) || roleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userId and roleIds array are required"
      });
    }

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify all roles exist
    const roles = await Role.findAll({
      where: { id: roleIds, isActive: true }
    });

    if (roles.length !== roleIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more roles not found or inactive"
      });
    }

    // Remove existing roles for this user
    await UserRole.destroy({ where: { userId } });

    // Assign new roles
    const userRolesToCreate = roleIds.map(roleId => ({
      userId,
      roleId
    }));

    await UserRole.bulkCreate(userRolesToCreate, { ignoreDuplicates: true });

    // Get updated user with roles
    const updatedUser = await User.findByPk(userId, {
      include: [{ model: Role, as: "roles" }]
    });

    res.status(200).json({
      success: true,
      message: `Assigned ${roleIds.length} roles to user`,
      data: {
        user: updatedUser,
        assignedRoles: roles
      }
    });

  } catch (error) {
    console.error("Error assigning roles:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Assign roles to user by role names
 */
export const assignRolesByName = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, roleNames } = req.body;

    if (!userId || !Array.isArray(roleNames) || roleNames.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userId and roleNames array are required"
      });
    }

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Find roles by names
    const roles = await Role.findAll({
      where: { name: roleNames, isActive: true }
    });

    if (roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid roles found"
      });
    }

    const roleIds = roles.map(role => role.id);
    const foundRoleNames = roles.map(role => role.name);
    const missingRoles = roleNames.filter(name => !foundRoleNames.includes(name));

    if (missingRoles.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Roles not found: ${missingRoles.join(', ')}`
      });
    }

    // Remove existing roles for this user
    await UserRole.destroy({ where: { userId } });

    // Assign new roles
    const userRolesToCreate = roleIds.map(roleId => ({
      userId,
      roleId
    }));

    await UserRole.bulkCreate(userRolesToCreate, { ignoreDuplicates: true });

    // Get updated user with roles
    const updatedUser = await User.findByPk(userId, {
      include: [{ model: Role, as: "roles" }]
    });

    res.status(200).json({
      success: true,
      message: `Assigned roles [${foundRoleNames.join(', ')}] to user`,
      data: {
        user: updatedUser,
        assignedRoles: roles
      }
    });

  } catch (error) {
    console.error("Error assigning roles by name:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Add additional roles to user (without removing existing ones)
 */
export const addRolesToUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, roleIds } = req.body;

    if (!userId || !Array.isArray(roleIds) || roleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userId and roleIds array are required"
      });
    }

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify all roles exist
    const roles = await Role.findAll({
      where: { id: roleIds, isActive: true }
    });

    if (roles.length !== roleIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more roles not found or inactive"
      });
    }

    // Add new roles (ignore duplicates)
    const userRolesToCreate = roleIds.map(roleId => ({
      userId,
      roleId
    }));

    await UserRole.bulkCreate(userRolesToCreate, { ignoreDuplicates: true });

    // Get updated user with roles
    const updatedUser = await User.findByPk(userId, {
      include: [{ model: Role, as: "roles" }]
    });

    res.status(200).json({
      success: true,
      message: `Added ${roleIds.length} roles to user`,
      data: {
        user: updatedUser,
        addedRoles: roles
      }
    });

  } catch (error) {
    console.error("Error adding roles:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Remove specific roles from user
 */
export const removeRolesFromUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, roleIds } = req.body;

    if (!userId || !Array.isArray(roleIds) || roleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userId and roleIds array are required"
      });
    }

    // Remove specified roles
    const deletedCount = await UserRole.destroy({
      where: { 
        userId,
        roleId: roleIds
      }
    });

    // Get updated user with roles
    const updatedUser = await User.findByPk(userId, {
      include: [{ model: Role, as: "roles" }]
    });

    res.status(200).json({
      success: true,
      message: `Removed ${deletedCount} roles from user`,
      data: {
        user: updatedUser,
        removedCount: deletedCount
      }
    });

  } catch (error) {
    console.error("Error removing roles:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Get user's current roles
 */
export const getUserRoles = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;

    if (!userIdStr) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    const user = await User.findByPk(userIdStr, {
      include: [{ model: Role, as: "roles" }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        roles: user.roles ?? []
      }
    });

  } catch (error) {
    console.error("Error getting user roles:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

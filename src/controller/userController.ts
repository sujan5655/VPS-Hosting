import { Request, Response } from "express";
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { UserRole } from "../models/UserRole.js";
import { Op } from "sequelize";

interface AuthRequest extends Request {
  user?: User;
}

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, roleIds } = req.body;

    // Validate input
    if (!userId || !Array.isArray(roleIds) || roleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide userId and roleIds array"
      });
    }

    // Check if the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if all roles exist
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
      include: [{ model: Role, as: 'roles' }],
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      message: "User roles updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    
    // Build where clause
    const whereClause: any = {};
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const includeClause: any = [
      { 
        model: Role, 
        as: 'roles',
        where: role ? { name: role } : undefined,
        required: !!role
      }
    ];

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: includeClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(count / Number(limit)),
          totalUsers: count,
          pageSize: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'description']
    });

    res.status(200).json({
      success: true,
      message: "Roles retrieved successfully",
      data: roles
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

import { Request, Response } from "express";
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { Op } from "sequelize";

interface AuthRequest extends Request {
  user?: User;
}

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, newRoleId } = req.body;

    // Validate input
    if (!userId || !newRoleId) {
      return res.status(400).json({
        success: false,
        message: "Please provide userId and newRoleId"
      });
    }

    // Check if the new role exists
    const newRole = await Role.findByPk(newRoleId);
    if (!newRole) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID"
      });
    }

    // Find and update the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update user role
    await user.update({ roleId: newRoleId });

    // Get updated user with role
    const updatedUser = await User.findByPk(userId, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
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
        as: 'role',
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

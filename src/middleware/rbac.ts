import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { Permission } from "../models/Permission.js";
import { RolePermission } from "../models/RolePermission.js";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

export const requirePermission = (resource: string, action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      const user = req.user;
      
      const role = await Role.findByPk(user.roleId);

      if (!role || !role.isActive) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Invalid role"
        });
      }

      const rolePermissions = await RolePermission.findAll({
        where: { roleId: role.id }
      });

      const permissionIds = rolePermissions.map(rp => rp.permissionId);
      const hasPermission = await Permission.findOne({
        where: {
          id: permissionIds,
          resource,
          action,
          isActive: true
        }
      });
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Missing permission to ${action} ${resource}`
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };
};

export const requireRole = (roleName: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      const user = req.user;
      const role = await Role.findByPk(user.roleId);

      if (!role || !role.isActive || role.name !== roleName) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Required role ${roleName}`
        });
      }

      next();
    } catch (error) {
      console.error("Role check error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };
};

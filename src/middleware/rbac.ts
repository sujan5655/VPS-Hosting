import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { Permission } from "../models/Permission.js";
import { RolePermission } from "../models/RolePermission.js";
import { UserRole } from "../models/UserRole.js";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: any;
  permissions?: string[];
  roles?: Role[];
}

/**
 * =========================
 * AUTHENTICATION MIDDLEWARE
 * =========================
 */
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Role, as: "roles" }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    /**
     * ATTACH USER TO REQUEST
     */
    req.user = user;
    req.roles = user.roles ?? [];

    /**
     * PRELOAD PERMISSIONS (OPTIMIZATION)
     * Instead of querying DB every request in requirePermission
     */
    console.log("🔐 authenticateToken: Loading permissions for user:", user.email);
    
    const roleIds = (user.roles ?? []).map((role: Role) => role.id);
    console.log("   User roles:", (user.roles ?? []).map((r: Role) => r.name).join(", "));
    console.log("   Role IDs:", roleIds.join(', '));

    const rolePermissions = await RolePermission.findAll({
      where: { roleId: roleIds },
    });

    console.log("   Role permissions found:", rolePermissions.length);

    const permissionIds = rolePermissions.map((rp) => rp.permissionId);

    const permissions = await Permission.findAll({
      where: {
        id: permissionIds,
        isActive: true,
      },
      attributes: ["name", "resource", "action"],
    });

    console.log("   Permissions loaded:", permissions.length);
    
    req.permissions = permissions.map((p) => p.name);
    
    // Check for the specific permission we need
    const updateProductsPermission = req.permissions.includes("update:products");
    console.log("   Has update:products permission:", updateProductsPermission);

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

/**
 * =========================
 * PERMISSION MIDDLEWARE
 * =========================
 */
export const requirePermission = (resource: string, action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.permissions) {
        console.log("❌ Permission check: Missing user or permissions");
        console.log("   User:", !!req.user);
        console.log("   Permissions:", req.permissions ? req.permissions.length : "none");
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const permissionKey = `${action}:${resource}`;

      const hasPermission =
        req.permissions.includes(permissionKey) ||
        req.permissions.includes(`manage:${resource}`);

      console.log("🔒 Permission check:");
      console.log("   User:", req.user.email);
      console.log("   Required:", permissionKey);
      console.log("   Available permissions:", req.permissions.length);
      console.log("   Has permission:", hasPermission);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Missing permission to ${action} ${resource}`,
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

/**
 * =========================
 * ROLE MIDDLEWARE
 * =========================
 */
export const requireRole = (roleName: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.roles || req.roles.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const hasRequiredRole = req.roles.some((role: any) => 
        role.isActive && role.name === roleName
      );

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Required role ${roleName}`,
        });
      }

      next();
    } catch (error) {
      console.error("Role check error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};
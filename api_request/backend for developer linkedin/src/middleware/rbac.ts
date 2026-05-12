import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Role } from "../models/Role";
import { RolePermission } from "../models/RolePermission";
import { Permission } from "../models/Permission";

export interface AuthRequest extends Request {
  user?: any;
  permissions?: string[];
  roles?: any[];
  processedMedia?: {
    images: Array<{
      url: string;
      publicId: string;
      alt: string;
      order: number;
    }>;
  };
}
export const authenticateToken=async(
  req:AuthRequest,res:Response,next:NextFunction
)=>{
  const authHeader = req.headers["authorization"]?.trim();
  const token =
    authHeader?.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : authHeader?.split(/\s+/)[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Accesss token required" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ success: false, message: "Server misconfiguration" });
  }

  let decoded: { userId: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
  } catch (err: unknown) {
    const e = err as { name?: string };
    if (e?.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired; sign in again or use refresh",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  try {
    const user = await User.findByPk(decoded.userId, {
      include: [
        {
          model: Role,
          as: "roles",
          include: [{ model: Permission, as: "permissions" }],
        },
      ],
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token",
      });
    }
    req.user = {
      id: user.id,
      roles: user.roles.map((r: any) => r.name),
      permissions: user.roles.flatMap((r: any) =>
        (r.permissions ?? []).map((p: any) => p.name)
      ),
    };
    next();
  } catch (error) {
    console.error("authenticateToken DB error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
}


export const requirePermission=(resource:string,action:string)=>{
  return async (req:AuthRequest,res:Response,next:NextFunction)=>{
    try {
      if(!req.user||!req.permissions){
        return res.status(401).json({
          success:false,
          message:"Authentication required"
        })
      }
      const permissionKey=`${action}:${resource}`;
      const hasPermission=req.permissions.includes(permissionKey)||req.permissions.includes(`manage:${resource}`);
      if(!hasPermission){
        return res.status(403).json({
          success:false,
          message:`Access denied: Missing permission to ${action}${resource}`
        })
      }
      next()
    } catch (error) {
      return res.status(500).json({
        success:false,
        message:"internal server error"
      })
    }
  }
}

export const hasPermission = (user: any, permission: string) => {
  return user.permissions.includes(permission);
};

export const requireRole = (roleName: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }
      
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
        message: "Internal server error"
      });
    }
  }
};
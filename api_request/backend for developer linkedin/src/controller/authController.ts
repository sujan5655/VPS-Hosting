import { Role } from "../models/Role"
import { User } from "../models/User"
import { UserRole } from "../models/UserRole"
import { RefreshToken } from "../models/RefreshToken"
import { Request, Response } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

function getCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie
  if (!header) return null
  const parts = header.split(";").map((p) => p.trim())
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1))
    }
  }
  return null
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

export const registerUser=async(req:Request,res:Response)=>{
  try {
    console.log("Registration request received:", req.body);
    const {name,email,password}=req.body
    if(!name||!email||!password){
      return res.status(400).json({
        success:false,
        message:"Please provide name, email and password"
      })

    }
    const existingUser=await User.findOne({
      where:{
        email
      }
    })
    if(existingUser){
      return res.status(400).json({
        success:false,
        message:"User with this email already exists"
      })
    }
    const defaultRole=await Role.findOne({
      where:{name:'developer'}
    })
    if(!defaultRole){
      return res.status(500).json({
        success:false,
        message:"Default user role not found"
      })
    }
    const userRoleId=defaultRole.id
    const saltRounds=10;
    const hashedPassword=await bcrypt.hash(password,saltRounds);
    const user=await User.create({
      name,email,password:hashedPassword
    })
    await UserRole.create({
      userId:user.id,
      roleId:userRoleId
    })
    const {password:userPassword,...userWithoutPassword}=user.toJSON();
    res.status(201).json({
      success:true,
      message:"User created successfully",
      data:userWithoutPassword
    })

  } catch (error) {
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}

export const loginUser=async(req:Request,res:Response)=>{
  try {
    const {email,password}=req.body
    if(!email||!password){
      return res.status(400).json({
        success:false,
        message:"Please provide email and password"
      })
    }
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'roles' }]
    })
    if(!user){
      return res.status(401).json({
        success:false,
        message:"invalid credentials"
      })
    }
    const isPasswordValid=await bcrypt.compare(password,user.password)
    if(!isPasswordValid){
      return res.status(401).json({
        success:false,
        message:"Invalid credentials"
      })
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    const accessToken = jwt.sign(
      {
        userId:user.id,email:user.email
      },
      process.env.JWT_SECRET,{expiresIn:'15m'}
    )
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }
    const refreshToken = jwt.sign(
      { userId: user.id, tokenVersion: Date.now() },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )
    const expiresAt=new Date();
    expiresAt.setDate(expiresAt.getDate()+7);
    const {password:userPassword,...userWithoutPassword}=user.toJSON();
    await RefreshToken.create({
      token:refreshToken,
      userId:user.id,
      expiresAt,
      
    })

    // Web: store refresh token in HttpOnly cookie (safe from JS).
    // Mobile (Flutter): still receives refreshToken in JSON response.
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction(),
      sameSite: isProduction() ? "none" : "lax",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.status(200).json({
      success:true,
      message:"Login Successful",
      data:{
        user:userWithoutPassword,
        accessToken,
        refreshToken
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

export const refreshToken=async(req:Request,res:Response)=>{
  try {
    // Web sends refresh token in HttpOnly cookie; mobile can send it in body.
    const refreshToken = req.body?.refreshToken ?? getCookie(req, "refreshToken");
    if(!refreshToken){
      return res.status(401).json({
        success:false,
        message:"Refresh token required"
      })
    }
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as { userId: string };
    const storedToken = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        isRevoked: false,
        expiresAt: { [require('sequelize').Op.gt]: new Date() }
      }
    })
     if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token"
      });
    }
     // Get user
    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Role, as: 'roles' }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate new access token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        user: (() => {
          const { password: _pw, ...userWithoutPassword } = user.toJSON() as any
          return userWithoutPassword
        })(),
      }
    });
  } catch (error) {
     res.status(401).json({
      success: false,
      message: "Invalid refresh token"
    });
  }
}


export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body?.refreshToken ?? getCookie(req, "refreshToken");

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token required"
      });
    }

    // Revoke the refresh token
    const tokenRecord = await RefreshToken.findOne({
      where: { token: refreshToken }
    });

    if (tokenRecord) {
      await tokenRecord.update({ isRevoked: true });
    }

    // Clear cookie for web clients
    res.clearCookie("refreshToken", {
      path: "/api/auth",
      sameSite: isProduction() ? "none" : "lax",
      secure: isProduction(),
    })

    res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

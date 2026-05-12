import { Op } from "sequelize";
import { Request, Response } from "express";
import { Role } from "../models/Role";
import { User } from "../models/User";
import { UserRole } from "../models/UserRole";


interface AuthRequest extends Request{
  user?:User;
}

export const updateUserRole=async(req:AuthRequest,res:Response)=>{
  try {
    const {userId,roleIds}=req.body;
    if(!userId||!Array.isArray(roleIds)||roleIds.length===0){
      return res.status(400).json({
        success:false,
        message:"Please provide userId and roleIds should be in array"
      })
    }
    const user=await User.findByPk(userId);
    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found"
      })
    }

    const roles=await Role.findAll({
      where:{id:roleIds,isActive:true}
    })
    if(roles.length!==roleIds.length){
      return res.status(400).json({
        success:false,
        message:"One or more roles not found or inactive"
      })
    }
    await UserRole.destroy({
      where:{
        userId
      }
    })
    const userRolesToCreate=roleIds.map(roleId=>({
      userId,roleId
    }))
    await UserRole.bulkCreate(userRolesToCreate,{ignoreDuplicates:true})
    const updatedUser=await User.findByPk(userId,{
      include:[{model:Role,as:'roles'}]
    });
res.status(200).json({
  success:true,
  message:"User roles updated successfully",
  data:updatedUser
})

  } catch (error) {
    res.status(400).json({
      success:false,
      message:"Internal server error"
    })
  }
}

export const getAllUsers=async(req:AuthRequest,res:Response)=>{
  try {
    const {search,role,page=1,limit=10}=req.query;
    const whereClause:any={}
    if(search){
      whereClause[Op.or]=[
        {name:{[Op.iLike]:`%${search}%`}},
        {email:{[Op.iLike]:`%${search}%`}}
      ];
    }
    const includeClause:any=[
      {
        model:Role,
        as:'roles',
        where:role?{name:role}:undefined,
        required:!!role
      }
    ]
    const offset=(Number(page)-1)*Number(limit);
    const{count,rows:users}=await User.findAndCountAll({
      where:whereClause,
      include:includeClause,
      attributes:{exclude:['password']},
      order:[['createdAt','DESC']],
      limit:Number(limit),
      offset
    })

    res.status(200).json({
      success:true,
      message:"Users retrieved successfully",
      data:{
        users,
        pagination:{
          currentPage:Number(page),
          totalPages:Math.ceil(count/Number(limit)),
          totalUsers:count,
          pageSize:Number(limit)
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}

export const getAllRoles=async(req:AuthRequest,res:Response)=>{
  try {
    const roles=await Role.findAll({
      where:{
        isActive:true,
        attributes:['id','name','description']
      }
    })
    res.status(200).json({
      success:true,
      message:"Roles retrieved successfully",
      data:roles
    })
  } catch (error) {
    res.status(400).json({
      success:false,
      message:"Failed to retrive data"
    })
  }
}
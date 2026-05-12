import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { Permission } from "../models/Permission.js";
import model from "sequelize/lib/model";
export const hasPermission=async(
  userId:string,
  permissionName:string
):Promise<boolean>=>{
  const user=await User.findByPk(userId,{
    include:[{
      model:Role,
      include:[Permission]}
    ]
  })
  if(!user) return false;
  for(const role of (user.roles ?? [])){
    for(const perm of (role.permissions ?? [])){
      if(perm.name===permissionName){
        return true;
      }
    }
  }

  return false;
}
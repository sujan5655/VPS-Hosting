import { config as dotenvConfig } from "dotenv";
dotenvConfig();

import { sequelize } from "../config/database";
import { Permission } from "../models/Permission";
import { Role } from "../models/Role"
import { RolePermission } from "../models/RolePermission";
import { User } from "../models/User";
import { UserRole } from "../models/UserRole";
import bcrypt from "bcrypt";

export const seedRBAC=async()=>{
  try {
    console.log('🚀 Starting RBAC seed...');
    
    // Connect to database first
    await sequelize.authenticate();
    console.log('✅ Database connected for seeding');
    
    // Sync models to ensure they exist
    await sequelize.sync({ force: false });
    console.log('✅ Models synchronized');

    const rolesData = [
      { name: "admin", description: "Full system control", isActive: true },
      { name: "moderator", description: "Moderate content and users", isActive: true },
      { name: "recruiter", description: "Manage jobs and candidates", isActive: true },
      // { name: "developer", description: "Normal user (profile, posts, connections)", isActive: true },
      { name: "user", description: "Default user role for new registrations", isActive: true },
    ];
    const roles=await Role.bulkCreate(rolesData,{
      ignoreDuplicates:true
    })
    const allRoles=await Role.findAll();
    const roleMap:{[key:string]:string}={};
    allRoles.forEach(r=>{
      roleMap[r.name]=r.id;
    })
    const permissionData=[
      // Profile
     {
      name:"read:profile",resource:"profile",action:"read",isActive:true
     },
     {
      name:"update:profile",resource:"profile",action:"update",isActive:true
     },

      // 📝 Posts (updated with ownership-based)
      { name: "create:post", resource: "post", action: "create", isActive: true },
      { name: "read:post", resource: "post", action: "read", isActive: true },
      { name: "update:post", resource: "post", action: "update", isActive: true },
      { name: "delete:post", resource: "post", action: "delete", isActive: true },
      { name: "manage:post", resource: "post", action: "manage", isActive: true },

      // 🔥 NEW (ownership-based)
      { name: "update:own-post", resource: "post", action: "update", isActive: true },
      { name: "delete:own-post", resource: "post", action: "delete", isActive: true },

      // 🤝 Connections
      { name: "send:connection", resource: "connection", action: "send", isActive: true },
      { name: "accept:connection", resource: "connection", action: "accept", isActive: true },
      { name: "read:connection", resource: "connection", action: "read", isActive: true },
      { name: "manage:connection", resource: "connection", action: "manage", isActive: true },

      // 💬 Messaging
      { name: "send:message", resource: "message", action: "send", isActive: true },
      { name: "read:message", resource: "message", action: "read", isActive: true },
      { name: "delete:message", resource: "message", action: "delete", isActive: true },

      // 💼 Jobs
      { name: "create:job", resource: "job", action: "create", isActive: true },
      { name: "read:job", resource: "job", action: "read", isActive: true },
      { name: "update:job", resource: "job", action: "update", isActive: true },
      { name: "delete:job", resource: "job", action: "delete", isActive: true },
      { name: "apply:job", resource: "job", action: "apply", isActive: true },

      // 🛡️ Admin
      { name: "manage:users", resource: "users", action: "manage", isActive: true },
      { name: "ban:user", resource: "users", action: "ban", isActive: true },

      // 🧹 Moderation
      { name: "moderate:content", resource: "content", action: "moderate", isActive: true },

      // 🔥 NEW (ownership-based for other entities)
      { name: "update:own-profile", resource: "profile", action: "update-own", isActive: true },
      { name: "delete:own-message", resource: "message", action: "delete-own", isActive: true },
      { name: "update:own-job", resource: "job", action: "update-own", isActive: true },
      { name: "delete:own-job", resource: "job", action: "delete-own", isActive: true },
]
await Permission.bulkCreate(permissionData,{ignoreDuplicates:true})
const permissions=await Permission.findAll();
const permissionMap:Record<string,string>={}
permissions.forEach(p=>{
  permissionMap[p.name]=p.id;
})
  //  Helper function
  const assignPermissions=async(roleName:string,perms:string[])=>{
    const roleId=roleMap[roleName];
    const data=perms.map(p=>({
      roleId,
      permissionId:permissionMap[p]
    }))
    await RolePermission.bulkCreate(data,{ignoreDuplicates:true})

  }
    // Role Permissions
    // Admin->All
    await assignPermissions("admin",Object.keys(permissionMap));
  
    // Moderator
    await assignPermissions("moderator",[
      "read:post","delete:post","moderate:content","ban:user","read:profile"
    ]);

    // Recruiter
    await assignPermissions("recruiter",[
      "create:job","read:job","update:own-job","delete:own-job","read:profile","send:message","send:connection","accept:connection","read:connection"
    ])
// // Developer(Normal User)
// await assignPermissions("developer",[
//   "read:profile","update:own-profile","create:post","read:post","update:own-post","delete:own-post","send:connection","accept:connection","read:connection","send:message","read:message","delete:own-message","read:job","apply:job"
// ])

// Default User (for new registrations)
await assignPermissions("user",[
  "read:profile","update:own-profile","create:post","read:post","update:own-post","delete:own-post","send:connection","accept:connection","read:connection","send:message","read:message","delete:own-message","read:job","apply:job"
])
// Default Admin User
const adminEmail=process.env.ADMIN_EMAIL;
const adminPassword=process.env.ADMIN_PASSWORD;
if(adminEmail && adminPassword){
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const [adminUser]=await User.findOrCreate({
    where:{email:adminEmail},
    defaults:{
      name:"Admin",
      email:adminEmail,
      password:hashedPassword
    }
  })
  await UserRole.findOrCreate({
  where:{
    userId:adminUser.id,
    roleId:roleMap["admin"]
  }
})
}
console.log("RBAC seed completed")
  } catch (error) {
    console.error("Error",error)
  }
}
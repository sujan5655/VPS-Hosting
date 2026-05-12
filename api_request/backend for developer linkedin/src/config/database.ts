import { config as dotenvConfig } from "dotenv";
dotenvConfig();

import { Sequelize } from "sequelize-typescript";
import { User } from "../models/User";
import { Role } from "../models/Role";
import { UserRole } from "../models/UserRole";
import { RefreshToken } from "../models/RefreshToken";
import { Permission } from "../models/Permission";
import { RolePermission } from "../models/RolePermission";
import { Post } from "../models/Post";
import { Profile } from "../models/Profile";
import { Connection } from "../models/Connection";
import { Job } from "../models/Job";
import { Message } from "../models/Message";

// Validate required environment variables
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const sequelize = new Sequelize({
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT) || 5432,
  dialect: "postgres",
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  ssl: process.env.NODE_ENV === 'production',
  models: [User, Role, UserRole, RefreshToken, Permission, RolePermission, Post, Profile, Connection, Job, Message],
});

const connectDB=async()=>{
  try{
    console.log('🔌 Attempting to connect to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    console.log(`🌐 Host: ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}`);
    return true;
  }
  catch(err){
    console.error('❌ Database connection failed:', err);
    console.error(`🔍 Connection details: ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`);
    return false;
  }
}
export {sequelize,connectDB}
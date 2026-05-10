import express from "express";
import dotenv from "dotenv";
import { connectDB, sequelize } from "./config/database.js";
import "./models/associations.js";
import app from "./app.js";
import { cleanupDuplicateCategories } from "./seed/cleanupCategories.js";
import { seedCategories } from "./seed/categorySeed.js";

dotenv.config();
console.log(process.env.DB_USER);

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
//   // Don't exit the process, just log the error
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (error) => {
//   console.error('Uncaught Exception:', error);
//   // Don't exit immediately, try graceful shutdown
//   process.exit(1);
// });

async function startServer() {
  try {
    console.log("🔍 Starting server initialization...");
    
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Clean up duplicate categories before sync
    // await cleanupDuplicateCategories();

    // Creates tables automatically
    await sequelize.sync({ alter: true });
    console.log("📦 Tables created/updated");

    // // Seed initial categories
    // await seedCategories();

    const server = app.listen(5000, () => {
      console.log("🚀 Server running on port 5000");
      console.log("📝 Server is now stable and ready to handle requests");
    });


  } catch (error) {
    console.error("❌ Server cannot be started:", error);
    process.exit(1);
  }
}

startServer();

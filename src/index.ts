import express from "express";
import dotenv from "dotenv";
import { connectDB, sequelize } from "./config/database.js";
import app from "./app.js";

dotenv.config();
console.log(process.env.DB_USER);

async function startServer() {
  try {
       await sequelize.authenticate();
    console.log("✅ Database connected");

    // Creates tables automatically
    await sequelize.sync({ alter: true });
    console.log("📦 Tables created/updated");

    app.listen(5000, () => {
      console.log(" Server running on port 5000");
    });
  } catch (error) {
    console.error("Server cannot be started:", error);
  }
}

startServer();

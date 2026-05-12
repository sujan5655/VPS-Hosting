import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env" });

import http from "http";
import app from "./app";
import { sequelize, connectDB } from "./config/database";
import { initSocket } from "./utils/socket"; // 👈 ADD THIS

export const config = {
  PORT: Number(process.env.PORT) || 5000,
};

async function startServer() {
  try {
    // DB connect
    const isConnected = await connectDB();
    if (!isConnected) throw new Error("Database connection failed");

    console.log("🔄 Syncing database models...");

    await sequelize.sync({ alter: true });

    console.log("✅ Database models synchronized successfully");

    // 🚀 CREATE HTTP SERVER (IMPORTANT)
    const server = http.createServer(app);

    // 🚀 INIT SOCKET
    initSocket(server);

    // START SERVER
    server.listen(config.PORT, () => {
      console.log(`🚀 Server started on PORT ${config.PORT}`);
      console.log(`🌐 Health check: http://localhost:${config.PORT}/db-status`);
    });

  } catch (error: unknown) {
    console.error("❌ Server cannot be started:", error);

    const err = error instanceof Error ? error : undefined;

    console.error("Error details:", {
      message: err?.message ?? String(error),
      stack: err?.stack,
      name: err?.name,
    });

    process.exit(1);
  }
}

startServer();
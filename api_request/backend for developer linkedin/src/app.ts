import express from "express";
import type { Request, Response } from "express";
import { sequelize } from "./config/database";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import profileRoutes from "./routes/profileRoutes";
import connectionRoutes from "./routes/connectionRoutes";
// import connectionRoutes from "./routes/connectionRoutes"
// import jobRoutes from "./routes/jobRoutes"
// import messageRoutes from "./routes/messageRoutes"

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5175",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:8080",
      "http://127.0.0.1:8080",
      "http://10.43.240.230:3000",
      "http://10.43.240.230:8080",
      "http://192.168.1.88:5000",
    ],
    credentials: true,
  }),
);

// Middleware to parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Simple root route for testing
app.get("/", (req, res) => {
  res.json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

// Mount auth routes
app.use("/api/auth", authRoutes);

// Mount user routes
app.use("/api/users", userRoutes);

// Mount LinkedIn-like platform routes
app.use("/api/posts", postRoutes);
app.use("/api/profiles", profileRoutes);
// app.use("/api/connections",)
app.use("/api/connections", connectionRoutes);
// app.use("/api/jobs", jobRoutes)
// app.use("/api/messages", messageRoutes)

export default app;

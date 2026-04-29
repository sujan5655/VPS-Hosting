import express from "express"
import cors from "cors"
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"

const app=express()

app.use(cors())
app.use(express.json())

// Mount auth routes
app.use("/api/auth", authRoutes)

// Mount user routes
app.use("/api/users", userRoutes)

export default app;
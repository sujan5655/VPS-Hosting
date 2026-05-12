import express from "express"

import cors from "cors"

import authRoutes from "./routes/authRoutes.js"

import userRoutes from "./routes/userRoutes.js"

import sellerApplicationRoutes from "./routes/sellerApplicationRoutes.js"

import productRoutes from "./routes/productRoutes.js"

import categoryRoutes from "./routes/categoryRoutes.js"

import cartRoutes from "./routes/cartRoutes.js"

import orderRoutes from "./routes/orderRoutes.js"



const app=express()



app.use(cors())



// JSON parsing middleware

app.use(express.json())



// Simple test endpoint

app.get("/api/test", (req, res) => {

  console.log('🧪 Main app test endpoint hit!');

  res.json({ message: "CI/CD pipeline is working properly! Now i can completely host a backend in the VPS Server with the change same github repository.Done By Sujan Chaudhary!!! Hello sujan chaldai cha hai", timestamp: new Date() });

});



// Mount auth routes

app.use("/api/auth", authRoutes)



// Mount user routes

app.use("/api/users", userRoutes)



// Mount seller application routes

app.use("/api/seller-applications", sellerApplicationRoutes)



// Mount product routes

app.use("/api/products", productRoutes)



// Mount category routes

app.use("/api/categories", categoryRoutes)



// Mount cart routes

app.use("/api/cart", cartRoutes)



// Mount order routes

app.use("/api/orders", orderRoutes)



export default app;
import { Router } from "express";
import { loginUser, logout, refreshToken, registerUser } from "../controller/authController";
import { authenticateToken, requirePermission, requireRole } from "../middleware/rbac";
import { getAllUsers } from "../controller/userController";



const router=Router();
router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/refresh",refreshToken)
router.post("/logout",logout)

router.get("/users",authenticateToken,requirePermission("users","read"),getAllUsers);

router.get("/admin-only",authenticateToken,requireRole("admin"),(req,res)=>{
  res.json({
    message:"Admin access granted"
  })
})
router.get("/manage-users",authenticateToken,requirePermission("users","manage"),(req,res)=>{
  res.json({
    message:"User management access granted"
  })
})
export default router;
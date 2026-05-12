// import { Router } from "express";
import { authenticateToken as authenticate, authenticateToken } from "../middleware/rbac";
// import { 
//   createProfile, 
//   getProfiles, 
//   getProfileById, 
//   getMyProfile, 
//   updateProfile, 
//   deleteProfile 
// } from "../controller/profileController";
// import { authorizeProfileUpdate } from "../middleware/authorize";
// import { uploadProfileImage, processProfileImageUpload } from "../middleware/upload";

import { Router } from "express";
import { upload } from "../middleware/upload";
import { getMyProfile, deleteProfile, updateProfile, createProfile, searchUsers } from "../controller/profileController";

const router = Router();
// Literal paths before /:userId so e.g. /search is not captured as userId "search"
router.get("/search", authenticate, searchUsers);

router.put(
  "/:userId",
  authenticate,
  upload.single("image"),
  updateProfile
);
// 👀 public view (must be logged in)
router.get("/:userId", authenticate, getMyProfile);

router.post("/",authenticate,upload.single("profileImage"),createProfile)

// 🗑 delete (own or admin)
router.delete("/:userId", authenticate, deleteProfile);
// // Public routes
// router.get("/", getProfiles);
// router.get("/:id", getProfileById);

// // Protected routes
// router.post("/", authenticate, uploadProfileImage, processProfileImageUpload, createProfile);
// router.get("/my/profile", authenticate, getMyProfile);

// // Ownership-based protected routes
// router.put("/:id", authenticate, uploadProfileImage, processProfileImageUpload, authorizeProfileUpdate, updateProfile);
// router.delete("/:id", authenticate, authorizeProfileUpdate, deleteProfile);

export default router;

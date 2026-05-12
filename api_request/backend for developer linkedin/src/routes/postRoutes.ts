import { Router } from "express";
import { authenticateToken as authenticate } from "../middleware/rbac";
import { 
  createPost,
  deletePost,
  getPosts,
  updatePost, 
  // getPosts, 
  // getPostById, 
  // updatePost, 
  // deletePost, 
  // likePost, 
  // getMyPosts 
} from "../controller/postController";
import { authorizePost } from "../middleware/authorizePost";
import { authorizeAction } from "../middleware/authorize";
import { upload } from "../middleware/upload";
const router = Router();

// Public routes
// router.get("/", getPosts);
// router.get("/:id", getPostById);

// Protected routes
router.post("/", authenticate,upload.array("images", 5),createPost);
router.put("/:id",authenticate,upload.array("images",5),authorizePost("update"),updatePost);
router.get("/",authenticate,getPosts)
router.delete( "/:id", authenticate,deletePost);
// router.get("/my/posts", authenticate, getMyPosts);
// router.put("/:id/like", authenticate, likePost);

// Ownership-based protected routes
// router.put("/:id", authenticate, uploadPostMedia, handleUploadErrors, processPostMedia, authorizePostUpdate, updatePost);
// router.delete("/:id", authenticate, authorizePostDelete, deletePost);

export default router;

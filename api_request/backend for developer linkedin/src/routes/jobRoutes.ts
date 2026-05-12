// import { Router } from "express";
// import { authenticateToken as authenticate } from "../middleware/rbac";
// import { 
//   createJob, 
//   getJobs, 
//   getJobById, 
//   updateJob, 
//   deleteJob, 
//   applyForJob, 
//   getMyJobs 
// } from "../controller/jobController";
// import { authorizeJobUpdate, authorizeJobDelete } from "../middleware/authorize";

// const router = Router();

// // Public routes
// router.get("/", getJobs);
// router.get("/:id", getJobById);

// // Protected routes
// router.post("/", authenticate, createJob);
// router.get("/my/jobs", authenticate, getMyJobs);
// router.post("/:id/apply", authenticate, applyForJob);

// // Ownership-based protected routes
// router.put("/:id", authenticate, authorizeJobUpdate, updateJob);
// router.delete("/:id", authenticate, authorizeJobDelete, deleteJob);

// export default router;

// import { Router } from "express";
// import { authenticateToken as authenticate } from "../middleware/rbac";
// import { 
//   sendConnectionRequest, 
//   getConnections, 
//   acceptConnectionRequest, 
//   rejectConnectionRequest, 
//   withdrawConnectionRequest, 
//   getMyConnections 
// } from "../controller/connectionController";
// import { authorizeAction } from "../middleware/authorize";

// const router = Router();

// // Protected routes
// router.post("/", authenticate, sendConnectionRequest);
// router.get("/", authenticate, getConnections);
// router.get("/my", authenticate, getMyConnections);

// // Connection management routes
// router.put("/:id/accept", authenticate, acceptConnectionRequest);
// router.put("/:id/reject", authenticate, rejectConnectionRequest);
// router.put("/:id/withdraw", authenticate, withdrawConnectionRequest);

// export default router;

import express from "express";
import { authenticateToken } from "../middleware/rbac";
import {
  getMyPendingIncoming,
  sendConnectionRequest,
  acceptConnection,
  rejectConnection,
  cancelConnection,
} from "../controller/connectionController";

const router = express.Router();

router.get("/incoming", authenticateToken, getMyPendingIncoming);
router.post("/request", authenticateToken, sendConnectionRequest);
router.post("/accept", authenticateToken, acceptConnection);
router.post("/reject", authenticateToken, rejectConnection);
router.post("/cancel", authenticateToken, cancelConnection);
export default router;

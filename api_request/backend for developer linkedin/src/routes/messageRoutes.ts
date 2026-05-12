// import { Router } from "express";
// import { authenticateToken as authenticate } from "../middleware/rbac";
// import { 
//   sendMessage, 
//   getMessages, 
//   getConversation, 
//   getConversations, 
//   markMessageAsRead, 
//   deleteMessage 
// } from "../controller/messageController";
// import { authorizeMessageDelete } from "../middleware/authorize";

// const router = Router();

// // Protected routes
// router.post("/", authenticate, sendMessage);
// router.get("/", authenticate, getMessages);
// router.get("/conversations", authenticate, getConversations);
// router.get("/conversation/:conversationId", authenticate, getConversation);

// // Message management routes
// router.put("/:id/read", authenticate, markMessageAsRead);
// router.delete("/:id", authenticate, authorizeMessageDelete, deleteMessage);

// export default router;

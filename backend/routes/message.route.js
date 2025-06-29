import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
	getConversations,
	getMessages,
	sendMessage,
	getUnreadCount,
} from "../controllers/message.controller.js";

const router = express.Router();

// Routes pour les messages
router.get("/unread/count", protect, getUnreadCount);
router.get("/conversations", protect, getConversations);
router.get("/:userId", protect, getMessages);
router.post("/", protect, sendMessage);

export default router; 
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
	getNotifications,
	getUnreadCount,
	markAsRead,
	markAllAsRead,
	deleteNotification,
	deleteAllNotifications
} from "../controllers/notification.controller.js";

const router = express.Router();

// Routes pour les notifications
router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.post("/:id/mark-as-read", protect, markAsRead);
router.post("/mark-all-as-read", protect, markAllAsRead);
router.delete("/:id", protect, deleteNotification);
router.delete("/", protect, deleteAllNotifications);

export default router;

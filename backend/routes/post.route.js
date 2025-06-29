import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
	createPost,
	getFeedPosts,
	getPost,
	deletePost,
	addComment,
	likePost,
	sharePost,
	applyToJobPost,
	getJobPostApplications,
} from "../controllers/post.controller.js";

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", protect, getFeedPosts);
router.get("/:postId", protect, getPost);
router.delete("/:postId", protect, deletePost);
router.post("/:postId/comment", protect, addComment);
router.post("/:postId/like", protect, likePost);
router.post("/:postId/share", protect, sharePost);

// Routes pour les posts de recruteurs
router.post("/:postId/apply", protect, applyToJobPost);
router.get("/:postId/applications", protect, getJobPostApplications);

export default router;

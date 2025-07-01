import express from "express";
import { protect, admin } from "../middleware/auth.middleware.js";
import {
	getAllUsers,
	updateUser,
	deleteUser,
	getAllPosts,
	updatePost,
	deletePost,
	createPost,
	updateUserPassword,
	validateUser,
	rejectUser,
	getPendingUsers,
	createUser,
	deleteConnection
} from "../controllers/admin.controller.js";
import { getAllOffers } from "../controllers/offres.controller.js";

const router = express.Router();

// Routes pour la gestion des utilisateurs
router.get("/users", protect, admin, getAllUsers);
router.get("/pending-users", protect, admin, getPendingUsers);
router.post("/users", protect, admin, createUser);
router.put("/users/:userId", protect, admin, updateUser);
router.delete("/users/:userId", protect, admin, deleteUser);
router.delete("/users/:userId/connections/:connectionId", protect, admin, deleteConnection);
router.put("/users/:userId/password", protect, admin, updateUserPassword);
router.put("/validate/:userId", protect, admin, validateUser);
router.put("/reject/:userId", protect, admin, rejectUser);

// Routes pour la gestion des posts
router.get("/posts", protect, admin, getAllPosts);
router.post("/posts", protect, admin, createPost);
router.put("/posts/:postId", protect, admin, updatePost);
router.delete("/posts/:postId", protect, admin, deletePost);

// Ajout route pour récupérer toutes les offres côté admin
router.get("/offres", protect, admin, getAllOffers);

export default router; 
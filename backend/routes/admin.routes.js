import express from "express";
import { 
    getAllUsers, 
    updateUser, 
    deleteUser, 
    getAllPosts, 
    updatePost, 
    deletePost,
    getPendingUsers,
    validateUser,
    rejectUser,
    updateUserPassword,
    createUser,
    deleteConnection,
    getStats
} from "../controllers/admin.controller.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Routes protégées par l'authentification et le rôle admin
router.use(verifyToken, isAdmin);

// Routes pour les statistiques
router.get("/stats", getStats);

// Routes pour les utilisateurs
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);
router.put("/users/:userId/password", updateUserPassword);

// Routes pour les posts
router.get("/posts", getAllPosts);
router.put("/posts/:postId", updatePost);
router.delete("/posts/:postId", deletePost);

// Routes pour la validation des utilisateurs
router.get("/pending-users", getPendingUsers);
router.put("/users/:userId/validate", validateUser);
router.put("/users/:userId/reject", rejectUser);

// Route pour la suppression des connexions
router.delete("/users/:userId/connections/:connectionId", deleteConnection);

export default router; 
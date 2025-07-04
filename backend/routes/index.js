import express from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import postRoutes from "./post.route.js";
import adminRoutes from "./admin.route.js";
import recruteurRoutes from "./recruteur.route.js";
import offresRoutes from "./offres.route.js";
import { queryChatbot } from '../controllers/chatbot.controller.js';
import { uploadMedia } from '../controllers/upload.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes publiques
router.use("/auth", authRoutes);

// Routes protégées
router.use("/users", protect, userRoutes);
router.use("/posts", protect, postRoutes);
router.use("/admin", protect, adminRoutes);
router.use("/recruteur", protect, recruteurRoutes);
router.use("/offres", protect, offresRoutes);

// Route pour l'upload de médias
router.post('/upload/media', protect, uploadMedia);

// Route pour le chatbot (protégée)
router.post('/chatbot/query', protect, queryChatbot);

export default router; 
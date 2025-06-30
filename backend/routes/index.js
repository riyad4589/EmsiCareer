import express from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import postRoutes from "./post.route.js";
import adminRoutes from "./admin.route.js";
import recruteurRoutes from "./recruteur.route.js";
import offresRoutes from "./offres.route.js";
import { queryChatbot } from '../controllers/chatbot.controller.js';

const router = express.Router();

// Routes publiques
router.use("/auth", authRoutes);
router.use("/offres", offresRoutes);

// Routes protégées
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/admin", adminRoutes);
router.use("/recruteur", recruteurRoutes);

// Route pour le chatbot
router.post('/chatbot/query', queryChatbot);

export default router; 
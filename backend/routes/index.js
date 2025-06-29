import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import postRoutes from "./post.routes.js";
import adminRoutes from "./admin.routes.js";
import recruteurRoutes from "./recruteur.route.js";
import offresRoutes from "./offres.route.js";

const router = express.Router();

// Routes publiques
router.use("/auth", authRoutes);
router.use("/offres", offresRoutes);

// Routes protégées
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/admin", adminRoutes);
router.use("/recruteur", recruteurRoutes);

export default router; 
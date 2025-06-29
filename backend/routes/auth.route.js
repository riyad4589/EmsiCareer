import express from "express";
import { login, signup, logout, getCurrentUser } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Routes publiques
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Routes protégées
router.get("/me", protect, getCurrentUser);

export default router;

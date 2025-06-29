// backend/routes/offres.route.js

import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getAllOffers,
  getOfferById,
  likeOffer,
  unlikeOffer,
  addComment,
  applyToOffer
} from "../controllers/offres.controller.js";

const router = express.Router();

// Routes publiques (pour voir les offres)
router.get("/", getAllOffers);
router.get("/:id", getOfferById);

// Routes protégées (pour interagir avec les offres)
router.post("/:id/like", protect, likeOffer);
router.delete("/:id/like", protect, unlikeOffer);
router.post("/:id/comments", protect, addComment);
router.post("/:id/apply", protect, applyToOffer);

export default router; 
// backend/routes/recruteur.route.js

import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { isRecruteur } from "../middleware/recruteur.middleware.js";
import {
  createOffer,
  getMyOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  getReceivedApplications
} from "../controllers/recruteur.controller.js";

const router = express.Router();

// Toutes les routes sont protégées et accessibles uniquement aux recruteurs
router.post("/offres", protect, isRecruteur, createOffer);
router.get("/offres", protect, isRecruteur, getMyOffers);
router.get("/offres/:id", protect, isRecruteur, getOfferById);
router.put("/offres/:id", protect, isRecruteur, updateOffer);
router.delete("/offres/:id", protect, isRecruteur, deleteOffer);
router.get("/candidatures", protect, isRecruteur, getReceivedApplications);

export default router;

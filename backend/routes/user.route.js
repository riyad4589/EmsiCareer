import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getSuggestedConnections, getPublicProfile, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/suggestions", protect, getSuggestedConnections);
router.get("/:username", protect, getPublicProfile);

router.put("/profile", protect, updateProfile);

export default router;

import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
	acceptConnectionRequest,
	getConnectionRequests,
	getConnectionStatus,
	getUserConnections,
	rejectConnectionRequest,
	removeConnection,
	sendConnectionRequest,
	getFriends,
	checkConnection,
	getUserConnectionsById,
} from "../controllers/connection.controller.js";

const router = express.Router();

// Routes protégées
router.use(protect);

// Routes pour les demandes de connexion
router.post("/request/:userId", sendConnectionRequest);
router.post("/accept/:requestId", acceptConnectionRequest);
router.post("/reject/:requestId", rejectConnectionRequest);
// Get all connection requests for the current user
router.get("/requests", getConnectionRequests);

// Routes pour les connexions
router.get("/", getUserConnections);
router.delete("/:userId", removeConnection);
router.get("/status/:userId", getConnectionStatus);
router.get("/friends", getFriends);
router.get("/check/:userId", checkConnection);
router.get("/user/:userId", getUserConnectionsById);

export default router;

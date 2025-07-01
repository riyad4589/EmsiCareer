import ConnectionRequest from "../models/connectionRequest.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Connection from "../models/connection.model.js";

export const sendConnectionRequest = async (req, res) => {
	try {
		const { userId } = req.params;
		console.log("=== DÉBUT sendConnectionRequest ===");
		console.log("Tentative d'envoi de demande de connexion:", {
			sender: req.user._id,
			recipient: userId,
			senderName: req.user.name
		});

		// Vérifier si l'utilisateur existe
		const recipient = await User.findById(userId);
		if (!recipient) {
			console.error("❌ Destinataire non trouvé:", userId);
			return res.status(404).json({
				success: false,
				message: "Utilisateur non trouvé",
			});
		}
		console.log("✅ Destinataire trouvé:", recipient.name);

		// Vérifier si l'utilisateur ne s'envoie pas une demande à lui-même
		if (req.user._id.toString() === userId) {
			console.error("❌ Tentative d'envoi de demande à soi-même");
			return res.status(400).json({
				success: false,
				message: "Vous ne pouvez pas vous envoyer une demande de connexion",
			});
		}

		// Vérifier si une connexion existe déjà
		const existingConnection = await Connection.findOne({
			$or: [
				{ user1: req.user._id, user2: userId },
				{ user1: userId, user2: req.user._id },
			],
			status: "accepted",
		});

		if (existingConnection) {
			console.error("❌ Connexion déjà existante");
			return res.status(400).json({
				success: false,
				message: "Vous êtes déjà connecté avec cet utilisateur",
			});
		}
		console.log("✅ Aucune connexion existante trouvée");

		// Vérifier si une demande en attente existe déjà
		const existingRequest = await ConnectionRequest.findOne({
			$or: [
				{ sender: req.user._id, recipient: userId },
				{ sender: userId, recipient: req.user._id },
			],
			status: "pending",
		});

		if (existingRequest) {
			console.error("❌ Demande en attente déjà existante");
			return res.status(400).json({
				success: false,
				message: "Une demande de connexion est déjà en attente",
			});
		}
		console.log("✅ Aucune demande en attente trouvée");

		// Créer la demande de connexion
		console.log("🔄 Création de la demande de connexion...");
		const connectionRequest = await ConnectionRequest.create({
			sender: req.user._id,
			recipient: userId,
			status: "pending",
		});

		console.log("✅ Demande de connexion créée avec succès:", {
			id: connectionRequest._id,
			sender: connectionRequest.sender,
			recipient: connectionRequest.recipient,
			status: connectionRequest.status
		});

		// Créer une notification pour le destinataire
		console.log("🔄 Création de la notification...");
		await Notification.create({
			sender: req.user._id,
			recipient: userId,
			type: "connection_request",
			message: `${req.user.name} vous a envoyé une demande de connexion`,
		});

		console.log("✅ Notification créée pour la demande de connexion");
		console.log("=== FIN sendConnectionRequest - SUCCÈS ===");

		res.json({
			success: true,
			message: "Demande de connexion envoyée",
			data: connectionRequest,
		});
	} catch (error) {
		console.error("❌ ERREUR dans sendConnectionRequest:", {
			error: error.message,
			stack: error.stack,
			userId: req.params.userId,
			senderId: req.user._id
		});
		res.status(500).json({
			success: false,
			message: "Erreur lors de l'envoi de la demande de connexion",
			details: error.message,
		});
	}
};

export const acceptConnectionRequest = async (req, res) => {
	try {
		const requestId = req.params.requestId;
		const userId = req.user._id;

		const request = await ConnectionRequest.findById(requestId);
		if (!request) {
			return res.status(404).json({
				success: false,
				message: "Demande de connexion non trouvée",
			});
		}

		if (request.recipient.toString() !== userId.toString()) {
			return res.status(403).json({
				success: false,
				message: "Non autorisé à accepter cette demande",
			});
		}

		// Vérifier si la connexion existe déjà
		const existingConnection = await Connection.findOne({
			$or: [
				{ user1: request.sender, user2: request.recipient },
				{ user1: request.recipient, user2: request.sender },
			],
			status: "accepted",
		});

		if (existingConnection) {
			console.log("Connexion déjà existante lors de l'acceptation de la demande.");
		} else {
			// Créer la connexion
			const newConnection = await Connection.create({
				user1: request.sender,
				user2: request.recipient,
				status: "accepted",
			});
			console.log("Nouvelle connexion créée lors de l'acceptation:", newConnection);
		}

		// Supprimer la demande
		await request.deleteOne();
		console.log("Demande de connexion supprimée:", request._id);

		// Créer une notification pour l'expéditeur
		await Notification.create({
			recipient: request.sender,
			sender: userId,
			type: "connection_accepted",
			message: `${req.user.name} a accepté votre demande de connexion`,
		});

		res.status(200).json({
			success: true,
			message: "Demande de connexion acceptée",
		});
	} catch (error) {
		console.error("Erreur lors de l'acceptation de la demande:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

export const rejectConnectionRequest = async (req, res) => {
	try {
		const { requestId } = req.params;
		console.log("Tentative de rejet de la demande:", requestId);

		const request = await ConnectionRequest.findById(requestId);
		if (!request) {
			console.error("Demande non trouvée:", requestId);
			return res.status(404).json({
				success: false,
				message: "Demande de connexion non trouvée",
			});
		}

		if (request.recipient.toString() !== req.user._id.toString()) {
			console.error("Non autorisé à rejeter cette demande");
			return res.status(403).json({
				success: false,
				message: "Non autorisé à rejeter cette demande",
			});
		}

		if (request.status !== "pending") {
			console.error("La demande n'est plus en attente");
			return res.status(400).json({
				success: false,
				message: "Cette demande n'est plus en attente",
			});
		}

		// Mettre à jour le statut de la demande
		request.status = "rejected";
		await request.save();

		// Créer une notification pour l'expéditeur
		await Notification.create({
			sender: req.user._id,
			recipient: request.sender,
			type: "connection_rejected",
			message: `${req.user.name} a rejeté votre demande de connexion`,
		});

		res.json({
			success: true,
			message: "Demande de connexion rejetée",
		});
	} catch (error) {
		console.error("Erreur détaillée lors du rejet:", {
			error: error.message,
			stack: error.stack,
		});
		res.status(500).json({
			success: false,
			message: "Erreur lors du rejet de la demande",
			details: error.message,
		});
	}
};

export const getConnectionRequests = async (req, res) => {
	try {
		const requests = await ConnectionRequest.find({
			recipient: req.user._id,
			status: "pending",
		})
			.populate("sender", "name profilePicture headline")
			.sort({ createdAt: -1 });

		res.json({
			success: true,
			data: requests,
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des demandes:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération des demandes de connexion",
		});
	}
};

export const getUserConnections = async (req, res) => {
	try {
		const userId = req.user._id;

		// Trouver toutes les connexions acceptées de l'utilisateur
		const connections = await Connection.find({
			$or: [
				{ user1: userId, status: "accepted" },
				{ user2: userId, status: "accepted" }
			]
		})
		.populate({
			path: 'user1 user2',
			select: 'name username profilePicture headline',
			lean: true
		})
		.lean();

		// Transformer les connexions en liste d'utilisateurs connectés
		const connectedUsers = connections.map(connection => {
			const connectedUser = connection.user1._id.toString() === userId.toString()
				? connection.user2
				: connection.user1;
			return {
				_id: connectedUser._id,
				name: connectedUser.name,
				username: connectedUser.username,
				profilePicture: connectedUser.profilePicture,
				headline: connectedUser.headline
			};
		});

		res.json({
			success: true,
			data: connectedUsers
		});
	} catch (error) {
		console.error("Error in getUserConnections controller:", error);
		res.status(500).json({ 
			success: false,
			message: "Erreur lors de la récupération des connexions",
			error: error.message
		});
	}
};

export const removeConnection = async (req, res) => {
	try {
		const myId = req.user._id;
		const { userId } = req.params;

		console.log("Tentative de suppression de la connexion:", {
			user1: myId,
			user2: userId
		});

		// Vérifier si les utilisateurs existent
		const [user1, user2] = await Promise.all([
			User.findById(myId),
			User.findById(userId)
		]);

		if (!user1 || !user2) {
			console.error("Un des utilisateurs n'existe pas");
			return res.status(404).json({
				success: false,
				message: "Utilisateur non trouvé"
			});
		}

		// Vérifier si une connexion existe dans la collection Connection
		const connection = await Connection.findOne({
			$or: [
				{ user1: myId, user2: userId },
				{ user1: userId, user2: myId }
			]
		});

		if (!connection) {
			console.log("Aucune connexion trouvée");
			return res.status(404).json({
				success: false,
				message: "Aucune connexion trouvée entre ces utilisateurs"
			});
		}

		// Supprimer la connexion
		await Connection.deleteOne({ _id: connection._id });
		console.log("Connexion supprimée de la collection Connection");

		// Créer une notification pour l'autre utilisateur
		await Notification.create({
			sender: myId,
			recipient: userId,
			type: "connection_removed",
			message: `${req.user.name} a supprimé la connexion avec vous`,
		});

		console.log("Connexion supprimée avec succès");

		return res.json({
			success: true,
			message: "Connexion supprimée avec succès"
		});
	} catch (error) {
		console.error("Erreur détaillée lors de la suppression de la connexion:", {
			error: error.message,
			stack: error.stack,
			userId: req.params.userId,
			myId: req.user._id
		});
		return res.status(500).json({
			success: false,
			message: "Erreur lors de la suppression de la connexion",
			error: error.message
		});
	}
};

export const getConnectionStatus = async (req, res) => {
	try {
		const userId = req.params.userId;
		console.log("Vérification du statut de connexion entre:", {
			user1: req.user._id,
			user2: userId
		});

		const connection = await Connection.findOne({
			$or: [
				{ user1: req.user._id, user2: userId },
				{ user1: userId, user2: req.user._id }
			],
			status: "accepted"
		});

		console.log("Résultat de la vérification:", connection);

		if (!connection) {
			return res.json({
				success: true,
				status: "not_connected"
			});
		}

		res.json({
			success: true,
			status: "accepted",
			connection
		});
	} catch (error) {
		console.error("Erreur lors de la vérification du statut:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la vérification du statut de connexion",
			error: error.message
		});
	}
};

export const getFriends = async (req, res) => {
	try {
		console.log("Récupération des amis pour l'utilisateur:", req.user._id);

		// Trouver toutes les connexions acceptées avec une seule requête
		const connections = await Connection.find({
			$or: [
				{ user1: req.user._id, status: "accepted" },
				{ user2: req.user._id, status: "accepted" }
			]
		})
		.populate({
			path: 'user1 user2',
			select: 'name username profilePicture headline',
			lean: true // Utiliser lean() pour obtenir des objets JavaScript simples au lieu de documents Mongoose
		})
		.lean(); // Utiliser lean() pour la requête principale aussi

		console.log("Connexions trouvées:", connections.length);

		// Transformer les connexions en liste d'amis
		const friends = connections.map(connection => {
			const friend = connection.user1._id.toString() === req.user._id.toString()
				? connection.user2
				: connection.user1;
			return {
				_id: friend._id,
				name: friend.name,
				username: friend.username,
				profilePicture: friend.profilePicture,
				headline: friend.headline
			};
		});

		console.log("Amis trouvés:", friends.length);

		res.json({
			success: true,
			data: friends
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des amis:", error);
		res.status(500).json({ 
			success: false,
			message: "Erreur lors de la récupération des amis",
			error: error.message
		});
	}
};

// Vérifier la connexion avec un utilisateur
export const checkConnection = async (req, res) => {
	try {
		const { userId } = req.params;
		console.log("Vérification de la connexion entre:", {
			user1: req.user._id,
			user2: userId
		});

		const connection = await Connection.findOne({
			$or: [
				{ user1: req.user._id, user2: userId },
				{ user1: userId, user2: req.user._id }
			]
		});

		console.log("Résultat de la vérification:", connection);

		res.json({
			success: true,
			exists: !!connection,
			status: connection?.status || null,
			connection
		});
	} catch (error) {
		console.error("Erreur lors de la vérification de la connexion:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la vérification de la connexion",
			error: error.message
		});
	}
};

// Récupérer les connexions d'un utilisateur spécifique (pour l'administration)
export const getUserConnectionsById = async (req, res) => {
	try {
		const { userId } = req.params;

		// Trouver toutes les connexions acceptées de l'utilisateur
		const connections = await Connection.find({
			$or: [
				{ user1: userId, status: "accepted" },
				{ user2: userId, status: "accepted" }
			]
		})
		.populate({
			path: 'user1 user2',
			select: 'name username profilePicture headline',
			lean: true
		})
		.lean();

		// Transformer les connexions en liste d'utilisateurs connectés
		const connectedUsers = connections.map(connection => {
			const connectedUser = connection.user1._id.toString() === userId.toString()
				? connection.user2
				: connection.user1;
			return {
				_id: connectedUser._id,
				name: connectedUser.name,
				username: connectedUser.username,
				profilePicture: connectedUser.profilePicture,
				headline: connectedUser.headline
			};
		});

		res.json({
			success: true,
			data: connectedUsers
		});
	} catch (error) {
		console.error("Error in getUserConnectionsById controller:", error);
		res.status(500).json({ 
			success: false,
			message: "Erreur lors de la récupération des connexions",
			error: error.message
		});
	}
};

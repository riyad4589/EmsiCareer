import ConnectionRequest from "../models/connectionRequest.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Connection from "../models/connection.model.js";

export const sendConnectionRequest = async (req, res) => {
	try {
		const { userId } = req.params;
		const senderId = req.user._id.toString();

		console.log("=== 📤 Envoi de demande de connexion ===");
		console.log("Demande de :", senderId, " → ", userId);

		// 1. Vérifier que le destinataire existe
		const recipient = await User.findById(userId);
		if (!recipient) {
			return res.status(404).json({
				success: false,
				message: "Utilisateur destinataire introuvable",
			});
		}

		// 2. Interdire l'auto-demande
		if (senderId === userId) {
			return res.status(400).json({
				success: false,
				message: "Vous ne pouvez pas vous connecter avec vous-même",
			});
		}

		// 3. Vérifier si une connexion acceptée existe déjà
		const existingConnection = await Connection.findOne({
			$or: [
				{ user1: senderId, user2: userId },
				{ user1: userId, user2: senderId },
			],
			status: "accepted",
		});

		if (existingConnection) {
			return res.status(400).json({
				success: false,
				message: "Vous êtes déjà connecté à cet utilisateur",
			});
		}

		// // 4. Vérifier s'il existe une demande en attente entre ces deux utilisateurs
		const existingRequest = await ConnectionRequest.findOne({
		 	$or: [
		 		{ sender: senderId, recipient: userId },
		 		{ sender: userId, recipient: senderId },
		 	],
		 	status: "pending",
		 });

		 if (existingRequest) {
		 	return res.status(400).json({
		 		success: false,
				message: "Une demande de connexion est déjà en attente entre vous deux",
			});
		 }

		// 5. Créer la demande de connexion
		const connectionRequest = await ConnectionRequest.create({
			sender: senderId,
			recipient: userId,
			status: "pending",
		});

		// 6. Créer une notification
		await Notification.create({
			sender: senderId,
			recipient: userId,
			type: "connection_request",
			message: `${req.user.name} vous a envoyé une demande de connexion`,
		});

		// 7. Émettre un événement socket.io au destinataire
		const io = req.app.get("io");
		if (io) {
			io.to(userId).emit("newConnectionRequest", {
				senderId,
				recipientId: userId,
				request: connectionRequest,
			});
		}

		console.log("✅ Demande et notification enregistrées");

		return res.status(201).json({
			success: true,
			message: "Demande de connexion envoyée",
			data: connectionRequest,
		});
	} catch (error) {
		console.error("❌ ERREUR dans sendConnectionRequest:", error);
		return res.status(500).json({
			success: false,
			message: "Erreur interne lors de la demande de connexion",
			details: error.message,
		});
	}
};


export const acceptConnectionRequest = async (req, res) => {
	try {
		const requestId = req.params.requestId;
		const userId = req.user._id.toString();

		// 1. Trouver la demande
		const request = await ConnectionRequest.findById(requestId);
		if (!request) {
			return res.status(404).json({
				success: false,
				message: "Demande de connexion non trouvée",
			});
		}

		// 2. Vérifier l'autorisation
		if (request.recipient.toString() !== userId) {
			return res.status(403).json({
				success: false,
				message: "Vous n'êtes pas autorisé à accepter cette demande",
			});
		}

		const senderId = request.sender.toString();
		let created = false;

		// 3. Vérifier si la connexion existe déjà
		const existingConnection = await Connection.findOne({
			$or: [
				{ user1: senderId, user2: userId },
				{ user1: userId, user2: senderId },
			],
			status: "accepted",
		});

		if (!existingConnection) {
			// 4. Créer la connexion
			await Connection.create({
				user1: senderId,
				user2: userId,
				status: "accepted",
			});
			created = true;
			console.log("✅ Connexion créée entre", senderId, "et", userId);
		} else {
			console.log("ℹ️ Connexion déjà existante");
		}

		// 5. Supprimer la demande acceptée
		await request.deleteOne();
		console.log("🗑️ Demande supprimée :", request._id);

		// 6. Supprimer toute autre demande miroir (inverse)
		await ConnectionRequest.deleteMany({
			sender: userId,
			recipient: senderId,
			status: "pending"
		});

		// 7. Notification à l'expéditeur
		await Notification.create({
			sender: userId,
			recipient: senderId,
			type: "connection_accepted",
			message: `${req.user.name} a accepté votre demande de connexion`,
		});

		// 8. Réponse
		return res.status(200).json({
			success: true,
			message: created
				? "Connexion acceptée avec succès"
				: "Connexion déjà existante, mais la demande a été nettoyée",
		});
	} catch (error) {
		console.error("❌ Erreur dans acceptConnectionRequest:", error);
		return res.status(500).json({
			success: false,
			message: "Erreur lors de l'acceptation de la demande",
			error: error.message
		});
	}
};


export const rejectConnectionRequest = async (req, res) => {
	try {
		const { requestId } = req.params;
		const userId = req.user._id.toString();

		console.log("📛 Rejet de la demande de connexion:", requestId);

		// 1. Trouver la demande
		const request = await ConnectionRequest.findById(requestId);
		if (!request) {
			return res.status(404).json({
				success: false,
				message: "Demande de connexion non trouvée",
			});
		}

		// 2. Vérifier l'autorisation
		if (request.recipient.toString() !== userId) {
			return res.status(403).json({
				success: false,
				message: "Vous n'êtes pas autorisé à rejeter cette demande",
			});
		}

		// 3. Vérifier que la demande est encore valide
		if (request.status !== "pending") {
			return res.status(400).json({
				success: false,
				message: "Cette demande n'est plus active",
			});
		}

		// 4. Supprimer uniquement la demande rejetée
		await request.deleteOne();

		// 5. Supprimer notification de type "connection_request" si existante
		await Notification.deleteMany({
			sender: request.sender,
			recipient: userId,
			type: "connection_request"
		});

		// 6. Créer une nouvelle notification de rejet
		await Notification.create({
			sender: userId,
			recipient: request.sender,
			type: "connection_rejected",
			message: `${req.user.name} a rejeté votre demande de connexion`,
		});

		return res.json({
			success: true,
			message: "Demande de connexion rejetée avec succès",
		});
	} catch (error) {
		console.error("❌ Erreur dans rejectConnectionRequest:", error);
		return res.status(500).json({
			success: false,
			message: "Erreur interne lors du rejet de la demande",
			details: error.message,
		});
	}
};


export const getConnectionRequests = async (req, res) => {
	try {
		const userId = req.user._id;

		console.log("📥 Récupération des demandes de connexion pour :", userId);

		const requests = await ConnectionRequest.find({
			recipient: userId,
			status: "pending"
		})
		.populate("sender", "name profilePicture headline")
		.sort({ createdAt: -1 });

		console.log(`✅ ${requests.length} demande(s) trouvée(s)`);

		res.status(200).json({
			success: true,
			message: "Demandes de connexion récupérées avec succès",
			data: requests
		});
	} catch (error) {
		console.error("❌ Erreur lors de la récupération des demandes:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération des demandes de connexion",
			details: error.message
		});
	}
};


export const getUserConnections = async (req, res) => {
	try {
		const userId = req.user._id.toString();
		console.log("🔗 Récupération des connexions pour :", userId);

		// 1. Récupérer toutes les connexions acceptées liées à l'utilisateur
		const connections = await Connection.find({
			$or: [
				{ user1: userId, status: "accepted" },
				{ user2: userId, status: "accepted" }
			]
		})
		.populate("user1", "name username profilePicture headline")
		.populate("user2", "name username profilePicture headline")
		.lean();

		console.log(`✅ ${connections.length} connexion(s) trouvée(s)`);

		// 2. Extraire l'autre utilisateur de chaque relation
		const connectedUsers = connections.map(connection => {
			const isUser1 = connection.user1._id.toString() === userId;
			const other = isUser1 ? connection.user2 : connection.user1;

			return {
				_id: other._id,
				name: other.name,
				username: other.username,
				profilePicture: other.profilePicture,
				headline: other.headline
			};
		});

		return res.status(200).json({
			success: true,
			message: "Connexions récupérées avec succès",
			total: connectedUsers.length,
			data: connectedUsers
		});
	} catch (error) {
		console.error("❌ Erreur dans getUserConnections:", error);
		return res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération des connexions",
			error: error.message
		});
	}
};


export const removeConnection = async (req, res) => {
	try {
		const myId = req.user._id.toString();
		const { userId } = req.params;

		console.log("🔁 Suppression de connexion entre", myId, "et", userId);

		// 1. Vérifier si une connexion existe
		const connection = await Connection.findOne({
			$or: [
				{ user1: myId, user2: userId },
				{ user1: userId, user2: myId }
			]
		}).lean();

		if (!connection) {
			console.warn("⚠️ Aucune connexion existante entre les deux utilisateurs");
			return res.status(404).json({
				success: false,
				message: "Aucune connexion trouvée entre ces utilisateurs"
			});
		}

		// 2. Supprimer la connexion
		await Connection.deleteOne({ _id: connection._id });
		console.log("✅ Connexion supprimée :", connection._id);

		// 3. Créer une notification pour l'autre utilisateur
		await Notification.create({
			sender: myId,
			recipient: userId,
			type: "connection_removed",
			message: `${req.user.name} a supprimé la connexion avec vous`,
		});

		return res.json({
			success: true,
			message: "Connexion supprimée avec succès"
		});
	} catch (error) {
		console.error("❌ Erreur lors de la suppression de la connexion :", error);
		return res.status(500).json({
			success: false,
			message: "Erreur lors de la suppression de la connexion",
			error: error.message
		});
	}
};


export const getConnectionStatus = async (req, res) => {
	try {
		const currentUserId = req.user._id.toString();
		const otherUserId = req.params.userId.toString();

		console.log("🔍 Vérification du statut de connexion :", {
			currentUserId,
			otherUserId
		});

		// Chercher une connexion acceptée
		const connection = await Connection.findOne({
			$or: [
				{ user1: currentUserId, user2: otherUserId },
				{ user1: otherUserId, user2: currentUserId }
			],
			status: "accepted"
		}).lean();

		if (!connection) {
			console.log("❌ Aucune connexion trouvée");
			return res.status(200).json({
				success: true,
				status: "not_connected",
				message: "Aucune connexion n'existe entre ces deux utilisateurs"
			});
		}

		console.log("✅ Connexion trouvée :", connection._id);

		return res.status(200).json({
			success: true,
			status: "accepted",
			message: "Les utilisateurs sont connectés",
			connection
		});
	} catch (error) {
		console.error("❌ Erreur dans getConnectionStatus :", error);
		return res.status(500).json({
			success: false,
			message: "Erreur lors de la vérification du statut de connexion",
			error: error.message
		});
	}
};


export const getFriends = async (req, res) => {
	try {
		const userId = req.user._id.toString();
		console.log("📥 Récupération des amis pour :", userId);

		// Requête pour les connexions acceptées
		const connections = await Connection.find({
			$or: [
				{ user1: userId, status: "accepted" },
				{ user2: userId, status: "accepted" }
			]
		})
		.populate("user1", "name username profilePicture headline")
		.populate("user2", "name username profilePicture headline")
		.lean(); // lean global uniquement après populate

		console.log(`🔗 ${connections.length} connexion(s) acceptée(s) trouvée(s)`);

		// Identifier l'ami dans chaque relation
		const friends = connections.map(conn => {
			const isUser1 = conn.user1._id.toString() === userId;
			const friend = isUser1 ? conn.user2 : conn.user1;

			return {
				_id: friend._id,
				name: friend.name,
				username: friend.username,
				profilePicture: friend.profilePicture,
				headline: friend.headline
			};
		});

		console.log(`👥 ${friends.length} ami(s) trouvé(s)`);

		return res.status(200).json({
			success: true,
			message: "Liste des amis récupérée avec succès",
			data: friends
		});
	} catch (error) {
		console.error("❌ Erreur dans getFriends:", error);
		return res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération des amis",
			error: error.message
		});
	}
};

export const checkConnection = async (req, res) => {
	try {
		const currentUserId = req.user._id.toString();
		const otherUserId = req.params.userId.toString();

		console.log("🔍 Vérification de la connexion entre :", {
			user1: currentUserId,
			user2: otherUserId
		});

		// Chercher la connexion dans les deux sens
		const connection = await Connection.findOne({
			$or: [
				{ user1: currentUserId, user2: otherUserId },
				{ user1: otherUserId, user2: currentUserId }
			]
		}).lean();

		if (!connection) {
			console.log("❌ Pas de connexion trouvée");
			return res.status(200).json({
				success: true,
				exists: false,
				status: null,
				message: "Aucune connexion n'existe entre ces utilisateurs"
			});
		}

		console.log("✅ Connexion trouvée avec statut :", connection.status);

		return res.status(200).json({
			success: true,
			exists: true,
			status: connection.status,
			connection,
			message: `Connexion ${connection.status}`
		});
	} catch (error) {
		console.error("❌ Erreur dans checkConnection :", error);
		return res.status(500).json({
			success: false,
			message: "Erreur lors de la vérification de la connexion",
			error: error.message
		});
	}
};


// Récupérer les connexions d'un utilisateur spécifique (pour l'administration)
export const getUserConnectionsById = async (req, res) => {
	try {
		const userId = req.params.userId.toString();

		console.log("🔍 Récupération des connexions pour l'utilisateur admin :", userId);

		const connections = await Connection.find({
			$or: [
				{ user1: userId, status: "accepted" },
				{ user2: userId, status: "accepted" }
			]
		})
		.populate("user1", "name username profilePicture headline")
		.populate("user2", "name username profilePicture headline")
		.lean(); // ← placer lean global ici uniquement

		console.log(`🔗 ${connections.length} connexion(s) trouvée(s)`);

		const connectedUsers = connections.map(connection => {
			const isUser1 = connection.user1._id.toString() === userId;
			const user = isUser1 ? connection.user2 : connection.user1;

			return {
				_id: user._id,
				name: user.name,
				username: user.username,
				profilePicture: user.profilePicture,
				headline: user.headline
			};
		});

		return res.status(200).json({
			success: true,
			message: "Connexions récupérées avec succès",
			total: connectedUsers.length,
			data: connectedUsers
		});
	} catch (error) {
		console.error("❌ Erreur dans getUserConnectionsById :", error);
		return res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération des connexions",
			error: error.message
		});
	}
};


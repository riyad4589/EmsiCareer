import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import Connection from "../models/connection.model.js";

// Récupérer toutes les conversations de l'utilisateur
export const getConversations = async (req, res) => {
	try {
		// Trouver tous les messages où l'utilisateur est soit l'expéditeur soit le destinataire
		const messages = await Message.find({
			$or: [{ sender: req.user._id }, { recipient: req.user._id }],
		})
			.sort({ createdAt: -1 })
			.populate("sender", "name profilePicture")
			.populate("recipient", "name profilePicture");

		// Organiser les messages par conversation
		const conversations = {};
		messages.forEach((message) => {
			const otherUser =
				message.sender._id.toString() === req.user._id.toString()
					? message.recipient
					: message.sender;

			if (!conversations[otherUser._id]) {
				conversations[otherUser._id] = {
					user: otherUser,
					lastMessage: message,
					unreadCount: 0,
				};
			}

			// Compter les messages non lus
			if (
				message.recipient._id.toString() === req.user._id.toString() &&
				!message.read
			) {
				conversations[otherUser._id].unreadCount++;
			}
		});

		res.json({
			success: true,
			data: Object.values(conversations),
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des conversations:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération des conversations",
		});
	}
};

// Récupérer les messages avec un utilisateur spécifique
export const getMessages = async (req, res) => {
	try {
		const messages = await Message.find({
			$or: [
				{ sender: req.user._id, recipient: req.params.userId },
				{ sender: req.params.userId, recipient: req.user._id },
			],
		})
			.sort({ createdAt: 1 })
			.populate("sender", "name profilePicture")
			.populate("recipient", "name profilePicture");

		// Marquer les messages comme lus
		await Message.updateMany(
			{
				sender: req.params.userId,
				recipient: req.user._id,
				read: false,
			},
			{ read: true }
		);

		res.json({
			success: true,
			data: messages,
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des messages:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération des messages",
		});
	}
};

// Envoyer un message
export const sendMessage = async (req, res) => {
	try {
		const { recipient, content } = req.body;
		const sender = req.user._id;

		console.log("Tentative d'envoi de message:", {
			sender,
			recipient,
			content,
			body: req.body
		});

		if (!content || content.trim() === "") {
			console.error("Contenu du message vide");
			return res.status(400).json({
				success: false,
				message: "Le contenu du message ne peut pas être vide",
			});
		}

		if (!recipient) {
			console.error("Destinataire non spécifié");
			return res.status(400).json({
				success: false,
				message: "Le destinataire est requis",
			});
		}

		// Vérifier si les utilisateurs existent
		const [senderUser, recipientUser] = await Promise.all([
			User.findById(sender),
			User.findById(recipient),
		]);

		if (!senderUser || !recipientUser) {
			console.error("Utilisateur non trouvé:", {
				senderExists: !!senderUser,
				recipientExists: !!recipientUser
			});
			return res.status(404).json({
				success: false,
				message: "Utilisateur non trouvé",
			});
		}

		// Vérifier la connexion entre les utilisateurs
		const connection = await Connection.findOne({
			$or: [
				{ user1: sender, user2: recipient },
				{ user1: recipient, user2: sender }
			],
			status: "accepted"
		});

		console.log("Vérification de la connexion:", {
			connectionFound: !!connection,
			sender,
			recipient
		});

		if (!connection) {
			console.error("Les utilisateurs ne sont pas connectés");
			return res.status(403).json({
				success: false,
				message: "Vous devez être connecté avec cet utilisateur pour lui envoyer un message",
			});
		}

		// Créer le message
		const message = await Message.create({
			sender,
			recipient,
			content: content.trim(),
		});

		console.log("Message créé avec succès:", message._id);

		// Créer une notification pour le destinataire
		await Notification.create({
			sender,
			recipient,
			type: "message",
			message: `${senderUser.name} vous a envoyé un message`,
		});

		// Récupérer les détails des utilisateurs pour la réponse
		const messageWithDetails = await Message.findById(message._id)
			.populate("sender", "name profilePicture")
			.populate("recipient", "name profilePicture");

		res.json({
			success: true,
			message: "Message envoyé avec succès",
			data: messageWithDetails,
		});
	} catch (error) {
		console.error("Erreur détaillée lors de l'envoi du message:", {
			error: error.message,
			stack: error.stack,
			body: req.body,
			user: req.user
		});
		res.status(500).json({
			success: false,
			message: "Erreur lors de l'envoi du message",
			details: error.message,
		});
	}
};

// Compter les messages non lus
export const getUnreadCount = async (req, res) => {
	try {
		const count = await Message.countDocuments({
			recipient: req.user._id,
			read: false,
		});

		res.json({
			success: true,
			count,
		});
	} catch (error) {
		console.error("Erreur lors du comptage des messages:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors du comptage des messages",
		});
	}
}; 
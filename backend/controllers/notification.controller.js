import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";

export const getNotifications = async (req, res) => {
	try {
		const notifications = await Notification.find({ recipient: req.user._id })
			.sort({ createdAt: -1 })
			.populate("sender", "name profilePicture")
			.populate("post", "content");

		// Formater les notifications avec des messages plus descriptifs
		const formattedNotifications = notifications.map(notification => {
			let message = notification.message;
			if (!message) {
				switch (notification.type) {
					case "like":
						message = `${notification.sender.name} a aimé votre publication`;
						break;
					case "comment":
						message = `${notification.sender.name} a commenté votre publication`;
						break;
					case "connection_request":
						message = `${notification.sender.name} vous a envoyé une demande de connexion`;
						break;
					case "connection_accepted":
						message = `${notification.sender.name} a accepté votre demande de connexion`;
						break;
					case "post_shared":
						message = `${notification.sender.name} a partagé votre publication`;
						break;
					default:
						message = "Nouvelle notification";
				}
			}

			return {
				...notification.toObject(),
				message,
				timeAgo: getTimeAgo(notification.createdAt)
			};
		});

		res.json({
			success: true,
			data: formattedNotifications,
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des notifications:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération des notifications",
		});
	}
};

export const getUnreadCount = async (req, res) => {
	try {
		const count = await Notification.countDocuments({
			recipient: req.user._id,
			read: false,
		});

		res.json({
			success: true,
			count,
		});
	} catch (error) {
		console.error("Erreur lors du comptage des notifications:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors du comptage des notifications",
		});
	}
};

export const markAsRead = async (req, res) => {
	try {
		const notification = await Notification.findOne({
			_id: req.params.id,
			recipient: req.user._id,
		});

		if (!notification) {
			return res.status(404).json({
				success: false,
				message: "Notification non trouvée",
			});
		}

		notification.read = true;
		await notification.save();

		res.json({
			success: true,
			message: "Notification marquée comme lue",
		});
	} catch (error) {
		console.error("Erreur lors du marquage de la notification:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors du marquage de la notification",
		});
	}
};

export const markAllAsRead = async (req, res) => {
	try {
		await Notification.updateMany(
			{ recipient: req.user._id, read: false },
			{ read: true }
		);

		res.json({
			success: true,
			message: "Toutes les notifications ont été marquées comme lues",
		});
	} catch (error) {
		console.error("Erreur lors du marquage des notifications:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors du marquage des notifications",
		});
	}
};

export const deleteNotification = async (req, res) => {
	try {
		const notification = await Notification.findOne({
			_id: req.params.id,
			recipient: req.user._id,
		});

		if (!notification) {
			return res.status(404).json({
				success: false,
				message: "Notification non trouvée",
			});
		}

		await notification.deleteOne();

		res.json({
			success: true,
			message: "Notification supprimée",
		});
	} catch (error) {
		console.error("Erreur lors de la suppression de la notification:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la suppression de la notification",
		});
	}
};

export const deleteAllNotifications = async (req, res) => {
	try {
		await Notification.deleteMany({ recipient: req.user._id });

		res.json({
			success: true,
			message: "Toutes les notifications ont été supprimées",
		});
	} catch (error) {
		console.error("Erreur lors de la suppression des notifications:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la suppression des notifications",
		});
	}
};

// Fonction utilitaire pour calculer le temps écoulé
function getTimeAgo(date) {
	const seconds = Math.floor((new Date() - date) / 1000);
	
	let interval = seconds / 31536000;
	if (interval > 1) return Math.floor(interval) + " an" + (Math.floor(interval) > 1 ? "s" : "");
	
	interval = seconds / 2592000;
	if (interval > 1) return Math.floor(interval) + " mois";
	
	interval = seconds / 86400;
	if (interval > 1) return Math.floor(interval) + " jour" + (Math.floor(interval) > 1 ? "s" : "");
	
	interval = seconds / 3600;
	if (interval > 1) return Math.floor(interval) + " heure" + (Math.floor(interval) > 1 ? "s" : "");
	
	interval = seconds / 60;
	if (interval > 1) return Math.floor(interval) + " minute" + (Math.floor(interval) > 1 ? "s" : "");
	
	return Math.floor(seconds) + " seconde" + (Math.floor(seconds) > 1 ? "s" : "");
}

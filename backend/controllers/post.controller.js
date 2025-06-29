import cloudinary from "../lib/cloudinary.js";
import Post from "../models/post.model.js";
import Offre from "../models/offre.model.js";
import Notification from "../models/notification.model.js";
import { sendCommentNotificationEmail } from "../emails/emailHandlers.js";
import Connection from "../models/connection.model.js";
import User from "../models/user.model.js";

export const getFeedPosts = async (req, res) => {
	try {
		// Récupérer les posts normaux
		const posts = await Post.find()
			.populate("author", "name username profilePicture headline role companyName industry")
			.populate("comments.user", "name profilePicture")
			.sort({ createdAt: -1 });

		// Récupérer les offres d'emploi
		const offres = await Offre.find()
			.populate("author", "name username profilePicture headline role companyName industry")
			.populate("comments.user", "name profilePicture")
			.sort({ createdAt: -1 });

		// Combiner et trier par date de création
		const allContent = [...posts, ...offres].sort((a, b) => 
			new Date(b.createdAt) - new Date(a.createdAt)
		);

		console.log("Nombre total de contenus récupérés:", allContent.length);
		console.log("Posts:", posts.length, "Offres:", offres.length);

		res.status(200).json({
			success: true,
			data: allContent
		});
	} catch (error) {
		console.error("Error in getFeedPosts controller:", error);
		res.status(500).json({ 
			success: false,
			message: "Erreur lors de la récupération du feed",
			error: error.message
		});
	}
};

export const createPost = async (req, res) => {
	try {
		const { content, visibility, isJobPost, jobDetails } = req.body;
		const author = req.user._id;
		let imageUrl = null;

		// Si une image est fournie, l'uploader sur Cloudinary
		if (req.files && req.files.image) {
			const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
				folder: "posts",
				width: 1000,
				height: 1000,
				crop: "limit"
			});
			imageUrl = result.secure_url;
		}

		// Vérifier le rôle de l'utilisateur
		const user = await User.findById(author);
		
		// Si c'est un recruteur, créer une offre d'emploi
		if (user.role === "recruteur") {
			// Extraire les détails de l'offre du contenu ou utiliser jobDetails
			const offreData = {
				author: author,
				titre: jobDetails?.titre || "Offre d'emploi",
				description: content || "Description de l'offre",
				localisation: jobDetails?.localisation || "Non spécifié",
				typeContrat: jobDetails?.typeContrat || "CDI",
				competencesRequises: jobDetails?.competencesRequises || [],
				dateExpiration: jobDetails?.dateExpiration || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
				image: imageUrl
			};

			const newOffre = new Offre(offreData);
			await newOffre.save();
			
			await newOffre.populate("author", "name username profilePicture headline role companyName industry");

			return res.status(201).json({
				success: true,
				data: newOffre,
				message: "Offre d'emploi créée avec succès"
			});
		}

		// Si c'est un utilisateur normal, créer un post normal
		const post = await Post.create({
			content: content || "",
			author,
			image: imageUrl,
			visibility: visibility || "public"
		});

		await post.populate("author", "name username profilePicture headline role companyName industry");

		res.status(201).json({
			success: true,
			data: post,
		});
	} catch (error) {
		console.error("Error in createPost controller:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.postId);

		if (!post) {
			return res.status(404).json({
				success: false,
				message: "Post non trouvé",
			});
		}

		if (post.author.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				success: false,
				message: "Non autorisé à supprimer ce post",
			});
		}

		await post.deleteOne();

		res.status(200).json({
			success: true,
			message: "Post supprimé avec succès",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

export const getPost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.postId)
			.populate("author", "name username profilePicture headline role companyName industry")
			.populate({
				path: "comments.user",
				select: "name username profilePicture",
			});

		if (!post) {
			return res.status(404).json({
				success: false,
				message: "Post non trouvé",
			});
		}

		res.status(200).json({
			success: true,
			data: post,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

export const addComment = async (req, res) => {
	try {
		const { content } = req.body;
		const postId = req.params.postId;
		const userId = req.user._id;

		const post = await Post.findById(postId).populate("author", "name email");
		if (!post) {
			return res.status(404).json({
				success: false,
				message: "Post non trouvé",
			});
		}

		const comment = {
			content,
			user: userId,
		};

		post.comments.push(comment);
		await post.save();

		await post.populate({
			path: "comments.user",
			select: "name username profilePicture",
		});

		// Créer une notification pour l'auteur du post
		if (post.author._id.toString() !== userId.toString()) {
			try {
				await Notification.create({
					recipient: post.author._id,
					sender: userId,
					type: "comment",
					post: postId,
					message: `${req.user.name} a commenté votre publication`,
					read: false
				});

				// Envoyer un email de notification
				if (post.author.email) {
					await sendCommentNotificationEmail(post.author.email, {
						commenterName: req.user.name,
						postContent: post.content.substring(0, 100) + "...",
						commentContent: content
					});
				}
			} catch (notificationError) {
				console.error("Erreur lors de la création de la notification:", notificationError);
			}
		}

		res.status(200).json({
			success: true,
			data: post,
		});
	} catch (error) {
		console.error("Erreur lors de l'ajout du commentaire:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

export const likePost = async (req, res) => {
	try {
		const postId = req.params.postId;
		const userId = req.user._id;

		const post = await Post.findById(postId).populate("author", "name email");
		if (!post) {
			return res.status(404).json({
				success: false,
				message: "Post non trouvé",
			});
		}

		const isLiked = post.likes.includes(userId);

		if (isLiked) {
			post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
		} else {
			post.likes.push(userId);

			// Créer une notification pour l'auteur du post
			if (post.author._id.toString() !== userId.toString()) {
				try {
					await Notification.create({
						recipient: post.author._id,
						sender: userId,
						type: "like",
						post: postId,
						message: `${req.user.name} a aimé votre publication`,
						read: false
					});
				} catch (notificationError) {
					console.error("Erreur lors de la création de la notification:", notificationError);
				}
			}
		}

		await post.save();

		res.status(200).json({
			success: true,
			data: post,
		});
	} catch (error) {
		console.error("Erreur lors du like du post:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

export const sharePost = async (req, res) => {
	try {
		const { recipientId, message } = req.body;
		const postId = req.params.postId;
		const senderId = req.user._id;

		// Vérifier si le post existe
		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({
				success: false,
				message: "Post non trouvé",
			});
		}

		// Vérifier si l'expéditeur est connecté au destinataire
		const connection = await Connection.findOne({
			$or: [
				{ sender: senderId, recipient: recipientId },
				{ sender: recipientId, recipient: senderId },
			],
			status: "accepted",
		});

		if (!connection) {
			return res.status(403).json({
				success: false,
				message: "Vous devez être connecté avec cette personne pour partager un post",
			});
		}

		// Créer une notification pour le destinataire
		await Notification.create({
			recipient: recipientId,
			sender: senderId,
			type: "share",
			post: postId,
			message,
		});

		res.status(200).json({
			success: true,
			message: "Post partagé avec succès",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ✅ Postuler à un post de recruteur
export const applyToJobPost = async (req, res) => {
	try {
		const { cv, lettreMotivation } = req.body;
		const postId = req.params.postId;
		const userId = req.user._id;

		const post = await Post.findById(postId).populate("author", "name role");
		
		if (!post) {
			return res.status(404).json({
				success: false,
				message: "Post non trouvé",
			});
		}

		if (!post.isJobPost) {
			return res.status(400).json({
				success: false,
				message: "Ce post n'est pas une offre d'emploi",
			});
		}

		// Vérifier si l'utilisateur a déjà postulé
		const alreadyApplied = post.candidatures.some(
			candidature => candidature.laureat.toString() === userId.toString()
		);

		if (alreadyApplied) {
			return res.status(400).json({
				success: false,
				message: "Vous avez déjà postulé à cette offre",
			});
		}

		// Vérifier que l'utilisateur n'est pas le recruteur
		if (post.author._id.toString() === userId.toString()) {
			return res.status(400).json({
				success: false,
				message: "Vous ne pouvez pas postuler à votre propre offre",
			});
		}

		// Ajouter la candidature
		post.candidatures.push({
			laureat: userId,
			cv: cv || "",
			lettreMotivation: lettreMotivation || "",
		});

		await post.save();

		// Créer une notification pour le recruteur
		try {
			await Notification.create({
				recipient: post.author._id,
				sender: userId,
				type: "job_application",
				post: postId,
				message: `${req.user.name} a postulé à votre offre d'emploi`,
				read: false
			});
		} catch (notificationError) {
			console.error("Erreur lors de la création de la notification:", notificationError);
		}

		res.status(201).json({
			success: true,
			message: "Candidature envoyée avec succès",
		});
	} catch (error) {
		console.error("Erreur lors de la candidature:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ✅ Obtenir les candidatures d'un post de recruteur
export const getJobPostApplications = async (req, res) => {
	try {
		const postId = req.params.postId;
		const userId = req.user._id;

		const post = await Post.findById(postId)
			.populate("author", "name role")
			.populate("candidatures.laureat", "name email profilePicture headline");

		if (!post) {
			return res.status(404).json({
				success: false,
				message: "Post non trouvé",
			});
		}

		// Vérifier que l'utilisateur est l'auteur du post
		if (post.author._id.toString() !== userId.toString()) {
			return res.status(403).json({
				success: false,
				message: "Non autorisé à voir les candidatures",
			});
		}

		res.status(200).json({
			success: true,
			data: post.candidatures,
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des candidatures:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Endpoint pour récupérer uniquement les posts classiques
export const getOnlyPosts = async (req, res) => {
	try {
		const posts = await Post.find()
			.populate("author", "name username profilePicture headline role companyName industry")
			.populate("comments.user", "name profilePicture")
			.sort({ createdAt: -1 });
		// Filtrer les posts sans auteur
		const validPosts = posts.filter(post => post.author);
		res.status(200).json({
			success: true,
			data: validPosts
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération des posts",
			error: error.message
		});
	}
};

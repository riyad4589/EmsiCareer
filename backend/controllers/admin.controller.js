import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import cloudinary from "../lib/cloudinary.js";
import bcrypt from "bcrypt";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { sendValidationSuccessEmail } from "../emails/emailHandlers.js";
import { sendRejectionEmail } from "../emails/emailHandlers.js";
import Connection from "../models/connection.model.js";
import { uploadMediaToAzure } from "../utils/azureBlob.js";
import Offre from "../models/offre.model.js";

// Obtenir tous les utilisateurs
export const getAllUsers = async (req, res) => {
	try {
		console.log("Récupération de tous les utilisateurs");
		const users = await User.find({})
			.select("-password")
			.sort({ createdAt: -1 });
		console.log(`Nombre d'utilisateurs trouvés: ${users.length}`);
		console.log("Premier utilisateur:", users[0]);
		res.status(200).json(users);
	} catch (error) {
		console.error("Erreur lors de la récupération des utilisateurs:", error);
		res.status(500).json({ message: error.message });
	}
};

// Mettre à jour un utilisateur
export const updateUser = async (req, res) => {
	const { userId } = req.params;
	const { name, emailEdu, emailPersonelle, role, status } = req.body;

	try {
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: 'Utilisateur non trouvé' });
		}

		// Validation pour le rôle admin ou recruteur et l'email EMSI lors de la mise à jour
		if (role === "user" && (!emailEdu || !emailEdu.endsWith("@emsi-edu.ma"))) {
			return res.status(400).json({ message: 'L\'email éducatif doit se terminer par @emsi-edu.ma pour les utilisateurs.' });
		} else if ((role === "admin" || role === "recruteur") && (!emailEdu || !emailEdu.endsWith("@emsi.ma"))) {
			return res.status(400).json({ message: 'L\'email éducatif doit se terminer par @emsi.ma pour les administrateurs et recruteurs.' });
		}

		// Vérifier si l'email éducatif est modifié et s'il existe déjà
		if (emailEdu && emailEdu !== user.emailEdu) {
			const existingUser = await User.findOne({ emailEdu });
			if (existingUser) {
				return res.status(400).json({ message: 'Cet email éducatif est déjà utilisé.' });
			}
		}

		user.name = name || user.name;
		user.emailEdu = emailEdu || user.emailEdu;
		user.emailPersonelle = emailPersonelle !== undefined ? emailPersonelle : user.emailPersonelle; // Allow clearing personal email
		user.role = role || user.role;
		user.status = status || user.status;

		await user.save();

		res.status(200).json({ message: "Utilisateur mis à jour avec succès", user });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Supprimer un utilisateur
export const deleteUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.userId);

		if (!user) {
			return res.status(404).json({ message: "Utilisateur non trouvé" });
		}

		// Supprimer tous les posts de l'utilisateur
		await Post.deleteMany({ author: user._id });

		// Supprimer l'utilisateur
		await user.deleteOne();

		res.status(200).json({ message: "Utilisateur supprimé avec succès" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Obtenir tous les posts
export const getAllPosts = async (req, res) => {
	try {
		console.log("Tentative de récupération de tous les posts");
		const posts = await Post.find({})
			.populate("author", "name email profilePicture role companyName industry")
			.sort({ createdAt: -1 });
		console.log("Posts récupérés:", posts.length);
		res.status(200).json(posts);
	} catch (error) {
		console.error("Erreur lors de la récupération des posts:", error);
		res.status(500).json({ message: error.message });
	}
};

// Mettre à jour un post
export const updatePost = async (req, res) => {
	try {
		const { content, visibility } = req.body;
		const post = await Post.findById(req.params.postId);

		if (!post) {
			return res.status(404).json({ message: "Post non trouvé" });
		}

		// Vérifier si le contenu est requis (selon le modèle)
		if (!content && !post.image) {
			return res.status(400).json({ message: "Le contenu est requis si aucune image n'est présente" });
		}

		// Mettre à jour uniquement les champs fournis
		const updateData = {};
		if (content !== undefined) updateData.content = content;
		if (visibility !== undefined) updateData.visibility = visibility;

		// Utiliser findByIdAndUpdate pour mettre à jour le post
		const updatedPost = await Post.findByIdAndUpdate(
			req.params.postId,
			{ $set: updateData },
			{ new: true, runValidators: true }
		).populate("author", "name username profilePicture headline");

		if (!updatedPost) {
			return res.status(404).json({ message: "Post non trouvé après la mise à jour" });
		}

		res.status(200).json({ 
			success: true,
			message: "Post mis à jour avec succès", 
			post: updatedPost 
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour du post:", error);
		res.status(500).json({ 
			success: false,
			message: error.message 
		});
	}
};

// Supprimer un post
export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.postId);

		if (!post) {
			return res.status(404).json({ message: "Post non trouvé" });
		}

		// Si le post contient une image, la supprimer de Cloudinary
		if (post.media) {
			const publicId = post.media.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(publicId);
		}

		await post.deleteOne();

		res.status(200).json({ message: "Post supprimé avec succès" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Récupérer tous les utilisateurs en attente de validation
export const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({ status: "pending" }).select("-password");
        res.json(pendingUsers);
    } catch (error) {
        console.error("Error in getPendingUsers:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const validateUser = async (req, res) => {
	try {
		const { userId } = req.params;

		const user = await User.findOneAndUpdate(
			{ _id: userId, status: "pending" }, // on évite d'activer un compte déjà actif ou rejeté
			{ status: "active" },
			{ new: true }
		).select("-password");

		if (!user) {
			return res.status(404).json({ message: "Utilisateur introuvable ou déjà validé." });
		}

		try {
			console.log("➡️ Envoi d'email de validation à :", user.emailPersonelle);
			await sendValidationSuccessEmail(user.emailPersonelle, user.name, user.emailEdu);
		} catch (err) {
			console.error("❌ Erreur d'envoi de l'email :", err.message);
		}

		return res.status(200).json({
			message: "✅ Utilisateur validé avec succès.",
			user,
		});
	} catch (error) {
		console.error("❌ Erreur dans validateUser:", error.message);
		return res.status(500).json({ message: "Erreur serveur." });
	}
};

// Rejeter un compte utilisateur
export const rejectUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndUpdate(
            userId,
            { status: "rejected" },
            { new: true }
        ).select("-password");

		// Envoi de mail de rejet
		try {
			console.log("📩 Envoi email de rejet à :", user.emailPersonelle);
			await sendRejectionEmail(user.emailPersonelle, user.name, user.emailEdu);
		} catch (err) {
			console.error("Erreur d'envoi d'email de rejet :", err.message);
		}

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json({ message: "Compte rejeté", user });
    } catch (error) {
        console.error("Error in rejectUser:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const updateUserPassword = async (req, res) => {
	try {
		const { password } = req.body;
		const { userId } = req.params;

		if (!password) {
			return res.status(400).json({ message: "Le mot de passe est requis" });
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "Utilisateur non trouvé" });
		}

		// Hash du nouveau mot de passe
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Mise à jour du mot de passe
		user.password = hashedPassword;
		await user.save();

		res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
	} catch (error) {
		console.error("Erreur lors de la mise à jour du mot de passe:", error);
		res.status(500).json({ message: error.message });
	}
};

// Créer un nouvel utilisateur


export const createUser = async (req, res) => {
	try {
		const {
			name, emailEdu, emailPersonelle, username,
			password, role, status,
			companyName, industry, location, description
		} = req.body;

		// ✅ Validation emails selon rôle
		if (role === "user" && (!emailEdu || !emailEdu.endsWith("@emsi-edu.ma"))) {
			return res.status(400).json({ message: "L'email éducatif doit se terminer par @emsi-edu.ma pour les utilisateurs." });
		} else if ((role === "admin" || role === "recruteur") && (!emailEdu || !emailEdu.endsWith("@emsi.ma"))) {
			return res.status(400).json({ message: "L'email éducatif doit se terminer par @emsi.ma pour les administrateurs et recruteurs." });
		}

		if (!name || !emailEdu || !username || !password) {
			return res.status(400).json({ message: "Veuillez remplir tous les champs requis." });
		}

		if (role === "recruteur" && (!companyName || !industry || !location || !description)) {
			return res.status(400).json({ message: "Champs entreprise manquants pour recruteur." });
		}

		const existingUserByUsername = await User.findOne({ username });
		if (existingUserByUsername) {
			return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris." });
		}

		const existingUser = await User.findOne({ emailEdu });
		if (existingUser) {
			return res.status(400).json({ message: "Cet email éducatif est déjà utilisé." });
		}

		if (password.length < 6) {
			return res.status(400).json({ message: "Mot de passe trop court (min 6 caractères)" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// 📤 Upload Azure si fichiers présents
		let profilePicture = "";
		let banniere = "";
		let companyLogo = "";

		if (req.files?.profilePicture) {
			profilePicture = await uploadMediaToAzure(req.files.profilePicture.tempFilePath, req.files.profilePicture.name, "profile");
		}
		if (req.files?.banniere) {
			banniere = await uploadMediaToAzure(req.files.banniere.tempFilePath, req.files.banniere.name, "banniere");
		}
		if (role === "recruteur" && req.files?.companyLogo) {
			companyLogo = await uploadMediaToAzure(req.files.companyLogo.tempFilePath, req.files.companyLogo.name, "logo");
		}

		const newUser = new User({
			name,
			username,
			emailEdu,
			emailPersonelle: emailPersonelle || undefined,
			password: hashedPassword,
			role: role || "user",
			status: status || "active",
			profilePicture,
			banniere,
			...(role === "recruteur" && {
				companyName,
				industry,
				location,
				description,
				companyLogo
			})
		});

		await newUser.save();

		// 📧 Email de bienvenue
		const profileUrl = `${process.env.CLIENT_URL}/profile/${newUser.username}`;
		try {
			await sendWelcomeEmail(newUser.emailEdu, newUser.name, profileUrl);
		} catch (e) {
			console.error("Erreur email bienvenue :", e.message);
		}

		const userWithoutPassword = await User.findById(newUser._id).select("-password");
		res.status(201).json({ message: "Utilisateur créé avec succès", user: userWithoutPassword });

	} catch (error) {
		console.error("Erreur création utilisateur admin :", error);
		res.status(500).json({ message: error.message });
	}
};


// Supprimer une connexion d'un utilisateur
export const deleteConnection = async (req, res) => {
    try {
        const { userId, connectionId } = req.params;
        console.log(`Tentative de suppression de la connexion ${connectionId} pour l'utilisateur ${userId}`);

        // Vérifier si les utilisateurs existent
        const [user1, user2] = await Promise.all([
            User.findById(userId),
            User.findById(connectionId)
        ]);

        if (!user1 || !user2) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Vérifier si une connexion existe dans la collection Connection
        const connection = await Connection.findOne({
            $or: [
                { user1: userId, user2: connectionId },
                { user1: connectionId, user2: userId }
            ]
        });

        if (!connection) {
            return res.status(404).json({ message: "Connexion non trouvée" });
        }

        // Supprimer la connexion
        await Connection.deleteOne({ _id: connection._id });

        console.log("Connexion supprimée avec succès");
        res.status(200).json({ message: "Connexion supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de la connexion:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "user" });
        const totalRecruiters = await User.countDocuments({ role: "recruteur" });
        const totalPosts = await Post.countDocuments({ author: { $in: await User.find({ role: "user" }).select('_id') } });
        const totalOffers = await Offre.countDocuments();
        // Nombre d'offres créées par des recruteurs
        const recruiterIds = await User.find({ role: "recruteur" }).select('_id');
        const totalOffersByRecruiters = await Offre.countDocuments({ author: { $in: recruiterIds.map(u => u._id) } });

        console.log("Statistiques calculées:", {
            totalUsers,
            totalRecruiters,
            totalPosts,
            totalOffers,
            totalOffersByRecruiters
        });

        res.json({
            totalUsers: totalUsers ?? 0,
            totalRecruiters: totalRecruiters ?? 0,
            totalPosts: totalPosts ?? 0,
            totalOffers: totalOffers ?? 0,
            totalOffersByRecruiters: totalOffersByRecruiters ?? 0
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
    }
};

// Créer un post pour un autre utilisateur (administration)
export const createPost = async (req, res) => {
	try {
		const { content, authorId, visibility = "public" } = req.body;

		if (!content) {
			return res.status(400).json({ message: "Le contenu est requis" });
		}

		if (!authorId) {
			return res.status(400).json({ message: "L'ID de l'auteur est requis" });
		}

		// Vérifier que l'auteur existe
		const author = await User.findById(authorId);
		if (!author) {
			return res.status(404).json({ message: "Auteur non trouvé" });
		}

		// Vérifier que l'auteur est un recruteur ou admin
		if (author.role !== "recruteur" && author.role !== "admin") {
			return res.status(400).json({ message: "L'auteur doit être un recruteur ou un administrateur" });
		}

		const post = await Post.create({
			content,
			author: authorId,
			visibility
		});

		await post.populate("author", "name username profilePicture headline role companyName industry location");

		res.status(201).json({
			success: true,
			message: "Post créé avec succès",
			data: post
		});
	} catch (error) {
		console.error("Erreur lors de la création du post:", error);
		res.status(500).json({ message: error.message });
	}
}; 
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import Connection from "../models/connection.model.js";
import { uploadToAzure, uploadMediaToAzure } from "../utils/azureBlob.js";

export const getSuggestedConnections = async (req, res) => {
	try {
		// Trouver toutes les connexions existantes de l'utilisateur
		const existingConnections = await Connection.find({
			$or: [
				{ user1: req.user._id, status: "accepted" },
				{ user2: req.user._id, status: "accepted" }
			]
		});

		// Extraire les IDs des utilisateurs connectés
		const connectedUserIds = existingConnections.map(connection => {
			return connection.user1.toString() === req.user._id.toString() 
				? connection.user2.toString() 
				: connection.user1.toString();
		});

		// Trouver les utilisateurs qui ne sont pas déjà connectés
		const suggestedUsers = await User.find({
			_id: {
				$ne: req.user._id,
				$nin: connectedUserIds,
			},
			role: "user",
			status: "active",
		})
			.select("name username profilePicture headline")
			.limit(4);

		res.json({
			success: true,
			data: suggestedUsers
		});
	} catch (error) {
		console.error("Error in getSuggestedConnections controller:", error);
		res.status(500).json({ 
			success: false,
			message: "Server error" 
		});
	}
};

export const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		
		if (!user) {
			return res.status(404).json({ message: "Utilisateur non trouvé" });
		}

		res.json(user);
	} catch (error) {
		console.error("Error in getProfile controller:", error);
		res.status(500).json({ message: "Erreur serveur" });
	}
};

export const getPublicProfile = async (req, res) => {
	try {
		const user = await User.findOne({ username: req.params.username }).select("-password");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(user);
	} catch (error) {
		console.error("Error in getPublicProfile controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateProfile = async (req, res) => {
	try {
		const allowedFields = [
			"name", "username", "headline", "about", "location", "skills", "experience", "education", "cv",
			"companyName", "industry", "description", "companyDescription", "website", "emailPersonelle", 
			"email", "phone", "linkedin", "github", "socialLinks"
		];

		const updatedData = {};

		for (const field of allowedFields) {
			if (req.body[field] !== undefined) {
				try {
					if (field === 'skills') {
						updatedData[field] = JSON.parse(req.body[field]);
					} else if (field === 'experience') {
						const experience = JSON.parse(req.body[field]);
						updatedData[field] = experience.map(exp => ({
							...exp,
							startDate: exp.startDate || "",
							endDate: exp.endDate || ""
						}));
					} else if (field === 'education') {
						const education = JSON.parse(req.body[field]);
						updatedData[field] = education.map(edu => ({
							...edu,
							startDate: edu.startDate || "",
							endDate: edu.endDate || ""
						}));
					} else if (field === 'socialLinks') {
						updatedData[field] = JSON.parse(req.body[field]);
					} else {
						// Pour les champs texte, on s'assure qu'ils ne sont pas undefined
						updatedData[field] = req.body[field] || "";
					}
				} catch (parseError) {
					console.error(`Erreur parsing ${field} :`, parseError);
					// Si le parsing échoue, on utilise la valeur brute
					updatedData[field] = req.body[field] || "";
				}
			}
		}

		// ✅ Image de profil => uploadMediaToAzure
		if (req.files?.profilePicture) {
			const url = await uploadMediaToAzure(
				req.files.profilePicture.tempFilePath,
				req.files.profilePicture.name,
				"profile"
			);
			updatedData.profilePicture = url;
		}

		if (req.files?.banniere) {
			const url = await uploadMediaToAzure(
				req.files.banniere.tempFilePath,
				req.files.banniere.name,
				"baniere"
			);
			updatedData.banniere = url;
		}

		// ✅ CV => uploadToAzure ou suppression
		if (req.files?.cv) {
			const url = await uploadToAzure(
				req.files.cv.tempFilePath,
				req.files.cv.name,
				"cv"
			);
			updatedData.cv = url;
		} else if (req.body.cv === "DELETE_CV") {
			// Supprimer le CV existant
			updatedData.cv = "";
			console.log("Suppression du CV demandée");
		}

		console.log("Données à mettre à jour:", updatedData);

		const user = await User.findByIdAndUpdate(
			req.user._id,
			{ $set: updatedData },
			{ new: true }
		).select("-password");

		console.log("Utilisateur mis à jour:", user);

		res.json(user);
	} catch (error) {
		console.error("Error in updateProfile controller:", error);
		res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
	}
};


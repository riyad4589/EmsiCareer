import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import Connection from "../models/connection.model.js";

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
			"name",
			"username",
			"headline",
			"about",
			"location",
			"skills",
			"experience",
			"education",
			"cv",
			// Champs spécifiques aux recruteurs
			"companyName",
			"industry",
			"description",
			"website",
			"emailPersonelle",
			"socialLinks"
		];

		const updatedData = {};

		// Traiter les champs textuels
		for (const field of allowedFields) {
			if (req.body[field] !== undefined) {
				try {
					if (field === 'skills') {
						updatedData[field] = JSON.parse(req.body[field]);
					} else if (field === 'experience') {
						const experience = JSON.parse(req.body[field]);
						updatedData[field] = experience.map(exp => ({
							...exp,
							startDate: exp.startDate ? new Date(exp.startDate) : null,
							endDate: exp.endDate ? new Date(exp.endDate) : null
						}));
					} else if (field === 'education') {
						const education = JSON.parse(req.body[field]);
						updatedData[field] = education.map(edu => ({
							...edu,
							startYear: edu.startYear ? parseInt(edu.startYear) : null,
							endYear: edu.endYear ? parseInt(edu.endYear) : null
						}));
					} else if (field === 'socialLinks') {
						updatedData[field] = JSON.parse(req.body[field]);
					} else {
						updatedData[field] = req.body[field];
					}
				} catch (parseError) {
					console.error(`Error parsing ${field}:`, parseError);
					continue;
				}
			}
		}

		// Traiter l'image de profil
		if (req.files && req.files.profilePicture) {
			const result = await cloudinary.uploader.upload(req.files.profilePicture.tempFilePath, {
				folder: "profile_pictures",
				width: 500,
				height: 500,
				crop: "fill"
			});
			updatedData.profilePicture = result.secure_url;
		}

		// Traiter l'image de couverture
		if (req.files && req.files.bannerImg) {
			const result = await cloudinary.uploader.upload(req.files.bannerImg.tempFilePath, {
				folder: "banner_images",
				width: 1500,
				height: 500,
				crop: "fill"
			});
			updatedData.bannerImg = result.secure_url;
		}

		// Traiter le CV
		if (req.files && req.files.cv) {
			const result = await cloudinary.uploader.upload(req.files.cv.tempFilePath, {
				folder: "cvs",
				resource_type: "raw"
			});
			updatedData.cv = result.secure_url;
		}

		const user = await User.findByIdAndUpdate(
			req.user._id,
			{ $set: updatedData },
			{ new: true }
		).select("-password");

		res.json(user);
	} catch (error) {
		console.error("Error in updateProfile controller:", error);
		res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
	}
};

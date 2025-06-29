import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
	try {
		console.log("Début de la vérification du token");
		let token;

		if (req.headers.authorization?.startsWith("Bearer")) {
			token = req.headers.authorization.split(" ")[1];
			console.log("Token trouvé dans les headers");
		}

		if (!token) {
			console.log("Pas de token trouvé");
			return res.status(401).json({ message: "Non autorisé, pas de token" });
		}

		console.log("Vérification du token avec JWT");
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log("Token décodé:", decoded);

		const user = await User.findById(decoded.userId).select("-password");
		console.log("Utilisateur trouvé:", user ? "Oui" : "Non");

		if (!user) {
			console.log("Utilisateur non trouvé");
			return res.status(401).json({ message: "Non autorisé, utilisateur non trouvé" });
		}

		if (user.status !== "active") {
			console.log("Statut utilisateur:", user.status);
			return res.status(403).json({ 
				message: "Votre compte est en attente de validation par un administrateur. Veuillez patienter." 
			});
		}

		console.log("Utilisateur authentifié avec succès");
		req.user = user;
		next();
	} catch (error) {
		console.error("Erreur d'authentification:", error);
		return res.status(401).json({ 
			message: "Non autorisé, token invalide",
			error: error.message 
		});
	}
};

export const admin = (req, res, next) => {
	console.log("Vérification des droits admin");
	console.log("Rôle utilisateur:", req.user?.role);
	
	if (req.user && req.user.role === "admin") {
		console.log("Accès admin autorisé");
		next();
	} else {
		console.log("Accès admin refusé");
		res.status(403).json({ message: "Non autorisé, droits d'administrateur requis" });
	}
};

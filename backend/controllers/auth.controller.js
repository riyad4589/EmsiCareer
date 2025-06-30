import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";



export const signup = async (req, res) => {
	try {
		const { name, username, password } = req.body;
		const { emailEdu, emailPersonelle } = req.body;
		const { role } = req.body;

		if (!name || !username || !emailEdu || !password) {
			return res.status(400).json({ message: "Tous les champs requis (Nom, Nom d'utilisateur, Email Éducatif, Mot de passe) sont manquants" });
		}

		// Validation de l'email selon le rôle
		if (role === "user" && !emailEdu.endsWith("@emsi-edu.ma")) {
			return res.status(400).json({ message: "L'email éducatif doit se terminer par @emsi-edu.ma pour les utilisateurs" });
		} else if ((role === "admin" || role === "recruteur") && !emailEdu.endsWith("@emsi.ma")) {
			return res.status(400).json({ message: "L'email éducatif doit se terminer par @emsi.ma pour les administrateurs et recruteurs" });
		}

		const existingEmailEdu = await User.findOne({ emailEdu });
		if (existingEmailEdu) {
			return res.status(400).json({ message: "Cet email éducatif est déjà utilisé" });
		}

		const existingUsername = await User.findOne({ username });
		if (existingUsername) {
			return res.status(400).json({ message: "Ce nom d'utilisateur est déjà utilisé" });
		}

		if (password.length < 6) {
			return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = new User({
			name,
			username,
			emailEdu,
			emailPersonelle,
			password: hashedPassword,
			status: "pending",
			role: role
		});

		await user.save();

		const profileUrl = process.env.CLIENT_URL + "/profile/" + user.username;

		// Assurez-vous que sendWelcomeEmail gère correctement les adresses email.
		try {
			await sendWelcomeEmail(user.emailPersonelle, user.name,profileUrl, user.emailEdu);
			// console.log(`Email de bienvenue envoyé à ${targetEmail}`);
		} catch (emailError) {
			console.error("Error sending welcome Email", emailError);
		}

		res.status(201).json({
			message: "Compte créé avec succès. Veuillez vérifier votre email (éducatif ou personnel) pour les instructions de validation.",
			redirect: true
		});
	} catch (error) {
		console.log("Error in signup: ", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const login = async (req, res) => {
	try {
		console.log("Début de la tentative de connexion");
		const { username, password } = req.body;
		console.log("Données reçues:", { username, password: "***" });

		if (!username || !password) {
			console.log("Champs manquants");
			return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis" });
		}

		// Vérifier si l'utilisateur existe
		const user = await User.findOne({ username });
		console.log("Recherche utilisateur:", { username, trouvé: !!user });

		if (!user) {
			console.log("Utilisateur non trouvé");
			return res.status(401).json({ message: "Identifiants invalides" });
		}

		// Vérifier le mot de passe
		const isMatch = await bcrypt.compare(password, user.password);
		console.log("Vérification mot de passe:", { match: isMatch });

		if (!isMatch) {
			console.log("Mot de passe incorrect");
			return res.status(401).json({ message: "Identifiants invalides" });
		}

		// Vérifier le statut du compte
		console.log("Statut du compte:", { 
			status: user.status, 
			role: user.role 
		});

		if (user.status === "pending") {
			console.log("Compte en attente");
			return res.status(403).json({ message: "Votre compte est en attente de validation" });
		}

		if (user.status === "rejected") {
			console.log("Compte rejeté");
			return res.status(403).json({ message: "Votre compte a été rejeté" });
		}

		if (user.status === "active") {
			console.log("Compte actif, génération du token");
			// Créer le token
			const token = jwt.sign(
				{ userId: user._id },
				process.env.JWT_SECRET,
				{ expiresIn: "7d" }
			);

			// Préparer la réponse
			const response = {
				token,
				user: {
					_id: user._id,
					name: user.name,
					username: user.username,
					emailEdu: user.emailEdu,
					emailPersonelle: user.emailPersonelle,
					role: user.role || "user",
					status: user.status,
					profilePicture: user.profilePicture,
					headline: user.headline
				}
			};

			console.log("Réponse préparée:", {
				token: "***",
				user: response.user
			});

			return res.status(200).json(response);
		}

		console.log("Statut de compte invalide:", user.status);
		return res.status(403).json({ message: "Statut de compte invalide" });
	} catch (error) {
		console.error("Erreur lors de la connexion:", error);
		return res.status(500).json({ 
			message: "Erreur serveur",
			error: error.message 
		});
	}
};

export const logout = (req, res) => {
	try {
		console.log("Déconnexion");
		res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: true });
		res.status(200).json({ message: "Déconnexion réussie" });
	} catch (error) {
		console.error("Erreur lors de la déconnexion:", error);
		res.status(500).json({ message: "Erreur serveur" });
	}
};

export const getCurrentUser = async (req, res) => {
	try {
		console.log("Récupération de l'utilisateur courant");
		const user = await User.findById(req.user._id)
			.select("-password");
		
		if (!user) {
			console.log("Utilisateur non trouvé");
			return res.status(404).json({ message: "Utilisateur non trouvé" });
		}

		console.log("Utilisateur trouvé:", {
			_id: user._id,
			username: user.username,
			role: user.role,
			status: user.status
		});

		res.json(user);
	} catch (error) {
		console.error("Erreur lors de la récupération de l'utilisateur:", error);
		res.status(500).json({ message: "Erreur serveur" });
	}
};

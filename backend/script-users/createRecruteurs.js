import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/user.model.js"; // chemin relatif vers ton modèle User

dotenv.config();

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(() => {
	console.log("✅ Connexion MongoDB réussie");
	createRecruteurs();
}).catch(err => {
	console.error("❌ Erreur MongoDB :", err.message);
});

const recruteurs = [
	{
		name: "Microsoft",
		username: "microsoft",
		emailEdu: "hr@microsoft.emsi.ma",
		emailPersonelle: "hr@microsoft.com",
		password: "microsoft123",
		companyName: "Microsoft Maroc",
		industry: "Technologie",
		location: "Casablanca",
		description: "Leader mondial des logiciels, Microsoft recrute activement des ingénieurs EMSI.",
		companyLogo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
		website: "https://www.microsoft.com"
	},
	{
		name: "Orange",
		username: "orange",
		emailEdu: "recrutement@orange.emsi.ma",
		emailPersonelle: "contact@orange.ma",
		password: "orange123",
		companyName: "Orange Maroc",
		industry: "Télécoms",
		location: "Rabat",
		description: "Orange Maroc s'engage dans la formation et l'emploi des jeunes ingénieurs marocains.",
		companyLogo: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg",
		website: "https://www.orange.ma"
	},
	{
		name: "AXA Assurance",
		username: "axa",
		emailEdu: "rh@axa.emsi.ma",
		emailPersonelle: "recrutement@axa.ma",
		password: "axa123",
		companyName: "AXA Assurance Maroc",
		industry: "Assurance",
		location: "Casablanca",
		description: "AXA recrute régulièrement les lauréats EMSI pour ses départements IT et cybersécurité.",
		companyLogo: "https://upload.wikimedia.org/wikipedia/commons/9/94/AXA_Logo.svg",
		website: "https://www.axa.ma"
	}
	// Tu peux en ajouter d'autres ici
];

async function createRecruteurs() {
	for (const data of recruteurs) {
		try {
			// Vérifie doublon
			const existing = await User.findOne({ emailEdu: data.emailEdu });
			if (existing) {
				console.log(`⚠️ ${data.emailEdu} existe déjà, ignoré.`);
				continue;
			}

			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(data.password, salt);

			const user = new User({
				...data,
				password: hashedPassword,
				role: "recruteur",
				status: "active"
			});

			await user.save();
			console.log(`✅ Recruteur créé : ${user.name}`);
		} catch (err) {
			console.error(`❌ Erreur création ${data.name} :`, err.message);
		}
	}
	mongoose.disconnect();
}

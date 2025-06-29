import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const checkUser = async (username) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connecté à MongoDB");

        const user = await User.findOne({ username });
        if (user) {
            console.log("Utilisateur trouvé:", {
                username: user.username,
                email: user.email,
                status: user.status,
                role: user.role
            });
        } else {
            console.log("Aucun utilisateur trouvé avec ce username");
        }

    } catch (error) {
        console.error("Erreur lors de la vérification:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

// Récupérer le username depuis les arguments de la ligne de commande
const username = process.argv[2];
if (!username) {
    console.log("Veuillez fournir un username en argument");
    process.exit(1);
}

checkUser(username); 
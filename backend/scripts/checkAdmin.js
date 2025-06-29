import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connecté à MongoDB");

        const admin = await User.findOne({ username: "admin" });
        if (admin) {
            console.log("Admin trouvé:", {
                username: admin.username,
                email: admin.email,
                role: admin.role,
                status: admin.status
            });
        } else {
            console.log("Aucun utilisateur admin trouvé");
        }

    } catch (error) {
        console.error("Erreur lors de la vérification:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

checkAdmin(); 
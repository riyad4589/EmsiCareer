import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const createDefaultUser = async () => {
  try {
    // Connexion à la BDD
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const name = "3zia";
    const username = "3zia";
    const emailEdu = "user_test@emsi-edu.ma";
    const emailPersonelle = "yenase8085@ofacer.com";
    const password = "3zia123**";

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("Utilisateur déjà existant !");
      return;
    }

    // Hash du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Création du nouvel utilisateur
    const newUser = new User({
      name,
      username,
      emailEdu,
      emailPersonelle,
      password: hashedPassword,
      role: "user",
      status: "active",
    });

    await newUser.save();
    console.log("✅ Utilisateur créé avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'utilisateur :", error.message);
    process.exit(1);
  }
};

createDefaultUser();

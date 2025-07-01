// createLeaureat.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

dotenv.config();

// Connexion à la base MongoDB
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connexion MongoDB établie");

// Données du lauréat à insérer
const laureat = {
  name: " Majghirou Mohamed Riyad",
  username: "riyad.maj",
  emailEdu: "riyad@emsi-edu.ma",
  password: "riyad123",
  role: "user",
  headline: "Full Stuck Engineer",
  profilePicture: "https://pfarecrutementcv.blob.core.windows.net/offresmedias/riyadPic.jpg",
  banniere: "https://pfarecrutementcv.blob.core.windows.net/offresmedias/baniere_logo_emsi_1751325477376.png",
  companyLogo: "",
  website: "https://Riyad.dev",
  socialLinks: {
    linkedin: "https://www.linkedin.com/in/mohamed-riyad-m-746912302/",
    twitter: "https://twitter.com/Riyad",
    facebook: "https://facebook.com/Riyad"
  },
  cv: "https://pfarecrutementcv.blob.core.windows.net/candidatures/CV AZZAM_MOHAMED 4IIR.pdf",
  status: "active"
};

try {
  const exists = await User.findOne({ username: laureat.username });
  if (exists) {
    console.log("❌ Utilisateur déjà existant");
    process.exit(1);
  }

  // Hash du mot de passe
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(laureat.password, salt);

  const newUser = new User({
    ...laureat,
    password: hashedPassword
  });

  await newUser.save();
  console.log("✅ Lauréat créé avec succès :", newUser.username);
  process.exit(0);
} catch (err) {
  console.error("❌ Erreur lors de la création :", err.message);
  process.exit(1);
}

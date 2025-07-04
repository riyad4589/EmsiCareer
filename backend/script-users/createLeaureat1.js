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
  name: "Mohamed AZZAM",
  username: "azzam.moo",
  emailEdu: "mohamed.azza,@emsi-edu.ma",
  password: "azzam123",
  role: "user",
  headline: "CyberSecurity Engineer",
  profilePicture: "https://pfarecrutementcv.blob.core.windows.net/offresmedias/DSC_4573.jpg",
  banniere: "https://pfarecrutementcv.blob.core.windows.net/offresmedias/baniere_logo_emsi_1751325477376.png",
  companyLogo: "",
  website: "https://azzam.dev",
  socialLinks: {
    linkedin: "https://www.linkedin.com/in/mohamed-azzam-93115823a/",
    twitter: "https://twitter.com/azzam",
    facebook: "https://facebook.com/azzam"
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

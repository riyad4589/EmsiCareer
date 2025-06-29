import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // ou smtp.mailtrap.io, smtp.office365.com, etc.
  port: 587,
  secure: false, // true pour port 465, false pour les autres
  auth: {
    user: process.env.SMTP_EMAIL,     // ⚠️ doit être défini dans .env
    pass: process.env.SMTP_PASS,  // ⚠️ mot de passe de l'application
  },
});

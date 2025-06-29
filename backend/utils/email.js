import nodemailer from "nodemailer";

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST || "smtp.gmail.com",
	port: process.env.EMAIL_PORT || 587,
	secure: process.env.EMAIL_SECURE === "true",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

// Fonction pour envoyer un email
export const sendEmail = async ({ to, subject, text, html }) => {
	try {
		const mailOptions = {
			from: process.env.EMAIL_FROM || "LinkedIn Clone <noreply@linkedin-clone.com>",
			to,
			subject,
			text,
			html,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("Email envoyé:", info.messageId);
		return info;
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email:", error);
		throw error;
	}
}; 
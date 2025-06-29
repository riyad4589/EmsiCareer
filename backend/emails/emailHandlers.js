// import transporter, { mailtrapClient,sender } from "../lib/mailtrap.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mailtrapClient,sender } from "../lib/mailtrap.js";
import { createPendingValidationEmailTemplate } from "./emailTemplates.js"
import { validationAccountleaureatTemplate } from "./emailTemplates.js"
import { rejectionAccountTemplate } from "./emailTemplates.js"


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const emailTemplate = fs.readFileSync(path.join(__dirname, 'mail.html'), 'utf-8');

const replacePlaceholders = (template, data) => {
	let result = template;
	for (const [key, value] of Object.entries(data)) {
		result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
	}
	return result;
};

// export const sendWelcomeEmail = async (email, name) => {
// 	const recipient = { to: email };

// 	try {
// 		const emailContent = replacePlaceholders(emailTemplate, {
// 			name: name.toUpperCase(),
// 			email: email
// 		});

// 		const mailOptions = {
// 			from: `"${sender.name}" <${sender.email}>`,
// 			to: recipient.to,
// 			subject: "Compte en attente de validation",
// 			html: emailContent,
// 		};

// 		const info = await transporter.sendMail(mailOptions);

// 		console.log("Email de bienvenue envoyé avec succès", info.messageId);
// 	} catch (error) {
// 		console.error("Erreur lors de l'envoi de l'email de bienvenue:", error);
// 		throw error;
// 	}
// };



export const sendWelcomeEmail = async (emailPersonelle, name, profileUrl,emailEdu) => {
    // Utiliser l'email personnel si fourni, sinon l'email éducatif
    const targetEmail = emailPersonelle 
	const emailEducatif = emailEdu ; // Si emailEdu est vide, on utilise emailPersonelle
	if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
    	console.warn("❌ Aucun email personnel valide pour l’envoi");
    	return; // On ne tente même pas l’envoi
  	}
    const recipient = [{ email: targetEmail }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
            subject: "Bienvenue sur le Portail EMSI",
            // Assurez-vous que createPendingValidationEmailTemplate utilise profileUrl si nécessaire
            html: createPendingValidationEmailTemplate(name, targetEmail, profileUrl,emailEducatif),
			category: "account-pending",
		});

        console.log("Email de validation en attente envoyé", response);
    } catch (error) {
        console.error("Erreur envoi mail : ", error.message);
        throw error;
    }
};



export const sendCommentNotificationEmail = async (
	recipientEmail,
	recipientName,
	commenterName,
	postUrl,
	commentContent
) => {
	const recipient = { to: recipientEmail };

	try {
		const emailContent = replacePlaceholders(emailTemplate, {
			name: recipientName.toUpperCase(),
			email: recipientEmail,
			message: `${commenterName} a commenté votre publication : "${commentContent}"`,
			buttonText: "Voir le commentaire",
			buttonUrl: postUrl
		});

		const mailOptions = {
			from: `"${sender.name}" <${sender.email}>`,
			to: recipient.to,
			subject: "Nouveau commentaire sur votre publication",
			html: emailContent,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("Email de notification de commentaire envoyé avec succès", info.messageId);
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email de notification:", error);
		throw error;
	}
};

export const sendValidationSuccessEmail = async (emailPersonelle, name,emailEdu) => {
	const recipient = [{ email: emailPersonelle }];
	const emailedu = emailEdu; // Si emailEdu est vide, on utilise emailPersonelle

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Votre compte EMSI a été validé",
			html: validationAccountleaureatTemplate(name, emailPersonelle,emailedu),
			category: "account-validated",
		});

		console.log("Email de validation envoyé", response);
	} catch (error) {
		console.error("Erreur envoi mail validation :", error.message);
		throw error;
	}
};


export const sendRejectionEmail = async (emailPersonelle, name, emailEdu) => {
	const recipient = [{ email: emailPersonelle }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Votre compte EMSI a été rejeté",
			html: rejectionAccountTemplate(name, emailEdu),
			category: "account-rejected",
		});

		console.log("Email de rejet envoyé", response);
	} catch (error) {
		console.error("Erreur envoi mail rejet :", error.message);
		throw error;
	}
};


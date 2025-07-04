// import transporter, { mailtrapClient,sender } from "../lib/mailtrap.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mailtrapClient,sender } from "../lib/mailtrap.js";
import { createPendingValidationEmailTemplate } from "./emailTemplates.js"
import { validationAccountleaureatTemplate } from "./emailTemplates.js"
import { rejectionAccountTemplate } from "./emailTemplates.js"
import { createNewOfferEmailTemplate } from "./emailTemplates.js";
import { createCandidatureAcceptedEmailTemplate } from "./emailTemplates.js";
import { createCandidatureRejectedEmailTemplate } from "./emailTemplates.js";
import { createNewCandidatureNotificationTemplate } from "./emailTemplates.js";




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


export const sendNewOfferEmailToLaureat = async (laureat, offer) => {
  const targetEmail = laureat.emailPersonelle;

  if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
    console.warn(`❌ Email invalide pour ${laureat.name}`);
    return;
  }


  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: [{ email: targetEmail }],
      subject: `📢 Nouvelle offre : ${offer.titre}`,
      html: createNewOfferEmailTemplate(laureat.name, offer),
      category: "new-offer"
    });

    console.log(`📬 Email envoyé à ${laureat.name} (${targetEmail})`);
  } catch (error) {
    console.error("Erreur lors de l’envoi de l’email : ", error.message);
  }
};



export const sendCandidatureAcceptedEmail = async (recipientUser, offerTitle) => {
  const targetEmail = recipientUser.emailPersonelle;

  if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
    console.warn(`❌ Email invalide pour ${recipientUser.name}`);
    return;
  }

  try {
    await mailtrapClient.send({
      from: sender,
      to: [{ email: targetEmail }],
      subject: `🎉 Votre candidature pour "${offerTitle}" a été acceptée`,
      html: createCandidatureAcceptedEmailTemplate(recipientUser.name, offerTitle),
      category: "candidature-accepted",
    });

    console.log(`📨 Email envoyé à ${recipientUser.name}`);
  } catch (error) {
    console.error("❌ Erreur envoi email:", error.message);
  }
};



export const sendCandidatureRejectedEmail = async (recipientUser, offerTitle) => {
  const targetEmail = recipientUser.emailPersonelle ;

  if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
    console.warn(`❌ Email invalide pour ${recipientUser.name}`);
    return;
  }

  try {
    await mailtrapClient.send({
      from: sender,
      to: [{ email: targetEmail }],
      subject: `🔔 Mise à jour concernant votre candidature à "${offerTitle}"`,
      html: createCandidatureRejectedEmailTemplate(recipientUser.name, offerTitle),
      category: "candidature-rejected",
    });

    console.log(`📨 Email de refus envoyé à ${recipientUser.name}`);
  } catch (error) {
    console.error("❌ Erreur envoi email (refus) :", error.message);
  }
};



export const sendNewCandidatureEmail = async ({
  recruteurEmail,
  recruteurNom,
  laureatNom,
  offreTitre,
  cvUrl,
  lettreMotivationUrl
}) => {
  const emailToSend = recruteurEmail?.trim(); // 🧼 nettoie les espaces

  console.log("🧪 Tentative d'envoi à :", emailToSend);

  if (!emailToSend || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToSend)) {
    console.warn("❌ Email du recruteur invalide :", emailToSend);
    return;
  }

  const html = createNewCandidatureNotificationTemplate(
    recruteurNom,
    laureatNom,
    offreTitre,
    cvUrl,
    lettreMotivationUrl
  );

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: [{ email: emailToSend }],
      subject: `📬 Nouvelle candidature pour "${offreTitre}"`,
      html,
      category: "new-candidature"
    });

    console.log("✅ Email de candidature envoyé à :", emailToSend);
    console.log("📨 Réponse Mailtrap :", response);
  } catch (error) {
    console.error("❌ Erreur envoi email candidature :", error.message);
    throw error;
  }
};



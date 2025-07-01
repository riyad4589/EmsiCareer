export function createPendingValidationEmailTemplate(name, targetEmail, profileUrl,emailEducatif) {
	return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compte en attente de validation</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #3ab957; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <img src="https://alpharepgroup.com/emsi/images/ajax-document-loader.png" alt="EMSI Logo" style="width: 250px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Inscription réussie !</h1>
    </div>
    <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <p style="font-size: 18px; color: #28a745;"><strong>Bonjour ${name},</strong></p>
      <p>Félicitations ! Votre compte a été créé avec succès sur notre plateforme.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
        <p style="font-size: 16px; margin: 0; color: #28a745;"><strong>📋 Prochaines étapes :</strong></p>
        <p style="margin: 10px 0 0 0;">Votre demande d'inscription est actuellement <strong>en cours de validation</strong> par notre équipe administrative.</p>
        <p style="margin: 10px 0 0 0;">Vous recevrez un email de confirmation dès que votre compte sera activé.<strong> Cela peut prendre 24 à 48 heures ouvrables.</strong></p>
      </div>


      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 16px; margin: 0; color: #155724;"><strong>Informations de votre compte :</strong></p>
        <p style="margin: 10px 0 0 0; color: #155724;"><strong>Email :</strong>${emailEducatif}<br><strong>Statut :</strong> En attente de validation</p>
      </div>

      <p>Merci pour votre patience !</p>
      
      <p>Cordialement,<br><strong>L'équipe EMSI</strong></p>
    </div>
  </body>
  </html>
`;
}



export function validationAccountleaureatTemplate(name, emailPersonelle,emailedu) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compte lauréat validé avec succès</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #3ab957; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <img src="https://alpharepgroup.com/emsi/images/ajax-document-loader.png" alt="EMSI Logo" style="width: 250px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Compte validé !</h1>
    </div>
    <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <p style="font-size: 18px; color: #28a745;"><strong>Bonjour ${name}</strong></p>
      <p>Votre compte lauréat a été validé avec succès par notre équipe administrative.</p>
    
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
        <p style="font-size: 16px; margin: 0; color: #28a745;"><strong>🎓 Votre statut de lauréat :</strong></p>
        <p style="margin: 10px 0 0 0;">Vous pouvez maintenant accéder à <strong>tous les services réservés aux lauréats EMSI</strong>.</p>
      </div>
      <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 16px; margin: 0; color: #155724;"><strong>Informations de votre compte validé :</strong></p>
        <p style="margin: 10px 0 0 0; color: #155724;"><strong>Nom :</strong> ${name}<br><strong>Email professionnel :</strong> ${emailedu}<br><strong>Statut :</strong> Lauréat EMSI validé ✅</p>
      </div>
      <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="font-size: 16px; margin: 0 0 15px 0; color: #1565c0;"><strong>🚀 Accédez à votre espace :</strong></p>
        <a href="#" style="background-color: #1565c0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Connexion à l'espace lauréat</a>
      </div>
      <p>Bienvenue dans la communauté des lauréats EMSI ! Profitez de tous les avantages et services qui vous sont maintenant accessibles.</p>
    
      <p>Cordialement,<br><strong>L'équipe EMSI</strong></p>
    </div>
  </body>
  </html>
  `
}


export function rejectionAccountTemplate(name, emailEdu){
  return `
  <!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Compte rejeté</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <!-- EN-TÊTE (identique à la version précédente) -->
  <div style="background-color: #3ab957; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <img src="https://alpharepgroup.com/emsi/images/ajax-document-loader.png" alt="EMSI Logo" style="width: 250px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Inscription refusée</h1>
  </div>

  <!-- CONTENU -->
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; color: #3ab957;"><strong>Bonjour ${name},</strong></p>

    <p>Nous vous remercions pour votre inscription sur notre plateforme.</p>

    <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
      <p style="font-size: 16px; margin: 0; color: #721c24;"><strong>❌ Votre demande a été rejetée.</strong></p>
      <p style="margin: 10px 0 0 0; color: #721c24;">
        Après examen, nous ne sommes pas en mesure d'approuver votre compte à ce stade.
        Veuillez vérifier que toutes les informations fournies sont correctes et conformes à nos critères.
      </p>
    </div>

    <!-- BLOC INFORMATIONS EN ROUGE -->
    <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="font-size: 16px; margin: 0; color: #721c24;"><strong>Informations de votre compte :</strong></p>
      <p style="margin: 10px 0 0 0; color: #721c24;">
        <strong>Email :</strong> ${emailEdu}<br>
        <strong>Statut :</strong> Rejeté
      </p>
    </div>

    <p>Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez soumettre une nouvelle demande, vous pouvez nous contacter à tout moment.</p>

    <p>Cordialement,<br><strong>L'équipe EMSI</strong></p>
  </div>
</body>
</html>`
}



export const createNewOfferEmailTemplate = (name, offer) => {
  // Fonction helper pour générer les images dans les détails
  const generateImagesInDetails = (medias) => {
    if (!medias || medias.length === 0) {
      return '';
    }

    const imageItems = medias.map(imageUrl => {
      return `
        <div style="margin: 15px 0; text-align: center;">
          <img src="${imageUrl}" alt="Visuel de l'offre" style="max-width: 100%; height: auto; border-radius: 6px; border: 1px solid #e0e0e0;">
        </div>
      `;
    }).join('');

    return imageItems;
  };

  return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle offre d'emploi disponible</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #3ab957; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <img src="https://alpharepgroup.com/emsi/images/ajax-document-loader.png" alt="EMSI Logo" style="width: 250px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📢 Nouvelle offre !</h1>
  </div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; color: #005baa;"><strong>Bonjour ${name}</strong></p>
    <p>Excellente nouvelle ! Une nouvelle offre d'emploi vient d'être publiée sur EMSI Career par <strong>${offer.author?.companyName || "un recruteur EMSI"}</strong>.</p>
   
    <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #005baa;">
      <h2 style="font-size: 18px; margin: 0 0 20px 0; color: #005baa; font-weight: bold;">💼 Détails de l'offre</h2>
      
      <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
        
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #005baa; vertical-align: top;">🏢 Entreprise :</td>
          <td style="padding: 10px 0; color: #333;">${offer.author?.companyName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #005baa; vertical-align: top;">🌐 Secteur :</td>
          <td style="padding: 10px 0; color: #333;">${offer.author?.industry}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #005baa; vertical-align: top;">🌐 Secteur :</td>
          <td style="padding: 10px 0; color: #333;">${offer.dateExpiration}</td>
        </tr>
      </table>

      ${generateImagesInDetails(offer.medias)}

    </div>
    
    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="font-size: 16px; margin: 0 0 15px 0; color: #1565c0;"><strong>🎯 Ne manquez pas cette opportunité :</strong></p>
      <a href="{{offerUrl}}" style="background-color: #005baa; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Voir l'offre et postuler</a>
    </div>
    
    <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p style="font-size: 14px; margin: 0; color: #856404;"><strong>💡 Conseil :</strong> Postulez rapidement ! Les meilleures offres sont souvent pourvues en premier.</p>
    </div>
    
    <p>Nous vous souhaitons beaucoup de succès dans votre recherche d'emploi !</p>
   
    <p>Cordialement,<br><strong>L'équipe Carrière EMSI</strong></p>
  </div>
</body>
</html>
  `;
};


export const createCandidatureAcceptedEmailTemplate = (name, offerTitle) => {
  return `
    <p>Bonjour <strong>${name}</strong>,</p>
    <p>Félicitations ! Votre candidature pour le poste <strong>${offerTitle}</strong> a été <span style="color:green;"><strong>acceptée</strong></span>.</p>
    <p>Le recruteur va vous contacter prochainement pour la suite du processus.</p>
    <p>Bonne continuation,<br>L'équipe EMSI</p>
  `;
};


export const createCandidatureRejectedEmailTemplate = (name, offerTitle) => {
  return `
    <p>Bonjour <strong>${name}</strong>,</p>
    <p>Nous vous remercions pour votre candidature au poste de <strong>${offerTitle}</strong>.</p>
    <p>Après examen, nous sommes au regret de vous informer que votre profil n'a pas été retenu pour ce poste.</p>
    <p>Nous vous souhaitons une bonne continuation dans votre recherche d'emploi.</p>
    <p>Cordialement,<br>L'équipe EMSI</p>
  `;
};



// emails/emailTemplates.js

export const createNewCandidatureNotificationTemplate = (recruteurNom, laureatNom, offreTitre, cvUrl, lettreMotivationUrl) => {
  return `
    <h2>Nouvelle Candidature reçue</h2>
    <p>Bonjour ${recruteurNom},</p>
    <p>Le lauréat <strong>${laureatNom}</strong> a postulé à votre offre : <strong>${offreTitre}</strong>.</p>
    <ul>
      <li>📄 <a href="${cvUrl}" target="_blank">Voir le CV</a></li>
      <li>📨 <a href="${lettreMotivationUrl}" target="_blank">Voir la lettre de motivation</a></li>
    </ul>
    <br/>
    <p>Bonne chance dans vos recrutements,</p>
    <p><strong>Portail EMSI Recrutement</strong></p>
  `;
};

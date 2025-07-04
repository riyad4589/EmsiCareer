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
  <!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle candidature reçue</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
    }
    
    .email-container {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 650px;
      margin: 0 auto;
      background-color: #f8fafc;
      padding: 0;
    }
    
    .header {
      background: #ffffff;
      padding: 40px 32px;
      text-align: center;
      border-bottom: 3px solid #0f172a;
    }
    
    .logo {
      width: 200px;
      height: auto;
      margin-bottom: 24px;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    
    .header-title {
      color: #0f172a;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.025em;
      margin-bottom: 8px;
    }
    
    .header-subtitle {
      color: #64748b;
      margin: 0;
      font-size: 16px;
      font-weight: 400;
    }
    
    .content {
      background-color: #ffffff;
      padding: 40px 32px;
    }
    
    .greeting-card {
      background: #f8fafc;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 32px;
      border-left: 4px solid #3ab957;
    }
    
    .greeting-title {
      font-size: 18px;
      color: #0f172a;
      margin: 0 0 8px 0;
      font-weight: 600;
    }
    
    .greeting-text {
      margin: 0;
      color: #475569;
      font-size: 15px;
      line-height: 1.6;
    }
    
    .candidate-section {
      background: #ffffff;
      padding: 32px;
      border-radius: 12px;
      margin: 32px 0;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
    
    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .section-icon {
      width: 40px;
      height: 40px;
      background: #3ab957;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      font-size: 18px;
    }
    
    .section-title {
      font-size: 20px;
      margin: 0 0 4px 0;
      color: #0f172a;
      font-weight: 600;
    }
    
    .section-subtitle {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }
    
    .info-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }
    
    .info-row {
      border-bottom: 1px solid #f1f5f9;
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .info-label {
      padding: 16px 0;
      font-weight: 500;
      color: #475569;
      vertical-align: top;
      width: 140px;
      font-size: 14px;
    }
    
    .info-value {
      padding: 16px 0;
      color: #0f172a;
      font-weight: 500;
      font-size: 15px;
    }
    
    .info-value.highlight {
      color: #3ab957;
      font-weight: 600;
    }
    
    .documents-section {
      background: #f8fafc;
      padding: 28px;
      border-radius: 12px;
      margin: 32px 0;
      border: 1px solid #e2e8f0;
    }
    
    .documents-title {
      font-size: 18px;
      margin: 0 0 24px 0;
      color: #0f172a;
      font-weight: 600;
      display: flex;
      align-items: center;
    }
    
    .documents-icon {
      width: 32px;
      height: 32px;
      background: #3ab957;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      font-size: 16px;
      color: white;
    }
    
    .documents-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .document-button {
      background: #ffffff;
      color: #374151;
      padding: 20px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      display: block;
      text-align: center;
      transition: all 0.2s ease;
      border: 2px solid #e5e7eb;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    
    .document-button:hover {
      border-color: #3ab957;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transform: translateY(-1px);
    }
    
    .document-button.primary {
      background: #3ab957;
      color: white;
      border-color: #3ab957;
    }
    
    .document-button.primary:hover {
      background: #3ab957;
      border-color: #3ab957;
    }
    
    .document-icon {
      font-size: 20px;
      margin-bottom: 8px;
      display: block;
    }
    
    .document-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .document-subtitle {
      font-size: 12px;
      opacity: 0.8;
    }
    
    .advice-section {
      background: #fef3c7;
      padding: 20px;
      border-radius: 8px;
      margin: 32px 0;
      border-left: 4px solid #f59e0b;
      display: flex;
      align-items: flex-start;
    }
    
    .advice-icon {
      width: 32px;
      height: 32px;
      background: #f59e0b;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;
      font-size: 16px;
      color: white;
    }
    
    .advice-text {
      font-size: 14px;
      margin: 0;
      color: #92400e;
      font-weight: 500;
      line-height: 1.6;
    }
    
    .footer {
      text-align: center;
      margin: 32px 0 0 0;
      padding: 32px;
      background: #f8fafc;
      border-radius: 8px;
      border-top: 1px solid #e2e8f0;
    }
    
    .footer-divider {
      width: 60px;
      height: 2px;
      background: #3b82f6;
      margin: 0 auto 20px auto;
      border-radius: 1px;
    }
    
    .footer-text {
      margin: 0;
      color: #64748b;
      font-size: 15px;
      line-height: 1.6;
    }
    
    .footer-signature {
      color: #0f172a;
      font-size: 16px;
      font-weight: 600;
      margin: 8px 0 4px 0;
    }
    
    .footer-tagline {
      font-size: 13px;
      color: #94a3b8;
      font-weight: 400;
    }
    
    @media (max-width: 640px) {
      .email-container {
        padding: 0;
      }
      
      .header, .content {
        padding: 24px 20px;
      }
      
      .candidate-section {
        padding: 24px 20px;
      }
      
      .documents-grid {
        grid-template-columns: 1fr;
      }
      
      .info-label {
        width: 120px;
        font-size: 13px;
      }
      
      .info-value {
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    
    <!-- Header -->
    <div class="header">
      <img src="https://alpharepgroup.com/emsi/images/ajax-document-loader.png" alt="EMSI Logo" class="logo">
      <h1 class="header-title">Nouvelle candidature reçue</h1>
      <p class="header-subtitle">Un talent EMSI souhaite rejoindre votre équipe</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      
      <!-- Greeting -->
      <div class="greeting-card">
        <p class="greeting-title">Bonjour ${recruteurNom},</p>
        <p class="greeting-text">Excellente nouvelle ! Un candidat de qualité vient de postuler à votre offre d'emploi sur <strong>EMSI Career</strong>. Nous vous invitons à examiner son profil ci-dessous.</p>
      </div>
     
      <!-- Candidate Information -->
      <div class="candidate-section">
        <div class="section-header">
          <div class="section-icon">👤</div>
          <div>
            <h2 class="section-title">Informations du candidat</h2>
            <p class="section-subtitle">Diplômé EMSI - Profil vérifié</p>
          </div>
        </div>
        
        <table class="info-table">
          <tr class="info-row">
            <td class="info-label">Candidat :</td>
            <td class="info-value">${laureatNom}</td>
          </tr>
          <tr class="info-row">
            <td class="info-label">Poste visé :</td>
            <td class="info-value highlight">${offreTitre}</td>
          </tr>
          <tr class="info-row">
            <td class="info-label">Formation :</td>
            <td class="info-value">École Marocaine des Sciences de l'Ingénieur</td>
          </tr>
        </table>
      </div>

      <!-- Documents Section -->
      <div class="documents-section">
        <h3 class="documents-title">
          <div class="documents-icon">📋</div>
          Documents de candidature
        </h3>
        
        <div class="documents-grid">
          <a href="${cvUrl}" target="_blank" class="document-button primary">
            <div class="document-icon">📄</div>
            <div class="document-title">Curriculum Vitae</div>
            <div class="document-subtitle">Télécharger le CV</div>
          </a>
          
          <a href="${lettreMotivationUrl}" target="_blank" class="document-button">
            <div class="document-icon">✉</div>
            <div class="document-title">Lettre de Motivation</div>
            <div class="document-subtitle">Lire la lettre</div>
          </a>
        </div>
      </div>
      
      <!-- Advice -->
      <div class="advice-section">
        <div class="advice-icon">💡</div>
        <div>
          <p class="advice-text">
            <strong>Conseil RH :</strong> Les candidats EMSI sont formés aux dernières technologies. Répondez dans les 48h pour maximiser vos chances de recruter ce talent !
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <div class="footer-divider"></div>
        <p class="footer-text">
          Cordialement,<br>
          <span class="footer-signature">L'équipe EMSI Career Services</span><br>
          <span class="footer-tagline">Connectons les talents aux opportunités</span>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

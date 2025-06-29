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
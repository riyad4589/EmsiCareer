
import Connection from "../models/connection.model.js";
import { sendCandidatureAcceptedEmail } from "../emails/emailHandlers.js";
import { sendCandidatureRejectedEmail } from "../emails/emailHandlers.js";
import User from "../models/user.model.js";
import Offre from "../models/offre.model.js";
import { sendNewOfferEmailToLaureat } from "../emails/emailHandlers.js";
import { uploadMediaToAzure } from "../utils/azureBlob.js"; // ✅ conteneur "offresmedias"

// ✅ Créer une offre d'emploi
export const createOffer = async (req, res) => {
  try {
    const {
      titre,
      description,
      localisation,
      typeContrat,
      dateExpiration,
    } = req.body;

    let competencesRequises = req.body.competencesRequises;

    // 🧠 Vérifier et parser les compétences
    if (typeof competencesRequises === "string") {
      try {
        const parsed = JSON.parse(competencesRequises);
        competencesRequises = Array.isArray(parsed)
          ? parsed
          : parsed.split(",").map((skill) => skill.trim());
      } catch (e) {
        competencesRequises = competencesRequises.split(",").map((skill) => skill.trim());
      }
    } else if (!Array.isArray(competencesRequises)) {
      competencesRequises = [];
    }

    // 📦 Upload des images uniquement vers Azure
    let mediasUrls = [];

    if (req.files?.medias) {
      const files = Array.isArray(req.files.medias)
        ? req.files.medias
        : [req.files.medias];

      for (const file of files) {
        if (!file.mimetype.startsWith("image/")) {
          console.log("⛔ Fichier ignoré (non image) :", file.name, file.mimetype);
          continue;
        }

        const url = await uploadMediaToAzure(file.tempFilePath, file.name);
        mediasUrls.push(url);
        console.log("✅ Image uploadée sur Azure :", url);
      }
    } else {
      console.log("⚠️ Aucun fichier 'medias' reçu dans req.files");
    }

    // ✅ Création de l'offre
    const newOffer = new Offre({
      author: req.user._id,
      titre,
      description,
      localisation,
      typeContrat,
      competencesRequises,
      dateExpiration,
      medias: mediasUrls,
    });

    await newOffer.save();
    await newOffer.populate("author", "name companyName industry");

    // 📤 Notifier les lauréats
    const laureats = await User.find({ role: "user" });

    await Promise.all(
      laureats.map((laureat) => sendNewOfferEmailToLaureat(laureat, newOffer))
    );

    return res.status(201).json({ message: "Offre créée avec succès", offer: newOffer });
  } catch (error) {
    console.error("❌ Erreur createOffer :", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Obtenir les offres du recruteur connecté
export const getMyOffers = async (req, res) => {
  try {
    const offers = await Offre.find({ author: req.user._id });
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// ✅ Obtenir une offre spécifique
export const getOfferById = async (req, res) => {
  try {
    const offer = await Offre.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offre non trouvée" });

    if (offer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès interdit à cette offre" });
    }

    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Modifier une offre
export const updateOffer = async (req, res) => {
  try {
    const offer = await Offre.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offre non trouvée" });

    if (offer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Modification non autorisée" });
    }

    Object.assign(offer, req.body);
    await offer.save();

    res.status(200).json({ message: "Offre mise à jour avec succès", offer });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Supprimer une offre
export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offre.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offre non trouvée" });

    if (offer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Suppression non autorisée" });
    }

    await offer.deleteOne();
    res.status(200).json({ message: "Offre supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Voir les candidatures reçues par le recruteur
export const getReceivedApplications = async (req, res) => {
  try {
    const offres = await Offre.find({ author: req.user._id })
      .populate("candidatures.laureat", "nom email")
      .select("titre candidatures");

    res.status(200).json(offres);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Statistiques du recruteur connecté
export const getRecruiterStats = async (req, res) => {
  try {
    const recruteurId = req.user._id;

    // Total des offres publiées par ce recruteur
    const totalOffers = await Offre.countDocuments({ author: recruteurId });

    // Offres non expirées (actives)
    const activeOffers = await Offre.countDocuments({
      author: recruteurId,
      dateExpiration: { $gte: new Date() }
    });

    // On récupère les offres pour compter les candidatures
    const offres = await Offre.find({ author: recruteurId });

    let totalApplications = 0;
    let pendingApplications = 0;

    for (const offre of offres) {
      totalApplications += offre.candidatures.length;
      pendingApplications += offre.candidatures.filter(
        (c) => c.status === "pending"
      ).length;
    }

    return res.status(200).json({
      totalOffers,
      activeOffers,
      totalApplications,
      pendingApplications
    });
  } catch (error) {
    console.error("❌ Erreur stats recruteur :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ Valider une candidature
export const acceptApplication = async (req, res) => {
  try {
    const { offerId, applicationId } = req.params;
    const recruiterId = req.user._id;

    const offer = await Offre.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: "Offre non trouvée." });
    }

    if (offer.author.toString() !== recruiterId.toString()) {
      return res.status(403).json({ message: "Action non autorisée." });
    }

    const application = offer.candidatures.id(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Candidature non trouvée." });
    }

    application.status = "accepted";
    
    // Créer une connexion si elle n'existe pas déjà
    const existingConnection = await Connection.findOne({
      $or: [
        { user1: recruiterId, user2: application.laureat },
        { user1: application.laureat, user2: recruiterId },
      ],
    });

    if (!existingConnection) {
      await Connection.create({
        user1: recruiterId,
        user2: application.laureat,
        status: "accepted",
      });
    }

    await offer.save();

    // Récupérer le lauréat
    const laureat = await User.findById(application.laureat);

    // Envoyer un mail de confirmation
    await sendCandidatureAcceptedEmail(laureat, offer.titre);


    res.status(200).json({ message: "Candidature validée avec succès." });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Refuser une candidature
export const rejectApplication = async (req, res) => {
  try {
    const { offerId, applicationId } = req.params;
    const recruiterId = req.user._id;

    const offer = await Offre.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: "Offre non trouvée." });
    }

    if (offer.author.toString() !== recruiterId.toString()) {
      return res.status(403).json({ message: "Action non autorisée." });
    }

    const application = offer.candidatures.id(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Candidature non trouvée." });
    }

    const laureat = await User.findById(application.laureat);

    // Supprimer la candidature
    application.deleteOne(); // ou offer.candidatures.pull(application._id);
    await offer.save();

    // Envoi de mail de refus
    await sendCandidatureRejectedEmail(laureat, offer.titre);

    res.status(200).json({ message: "Candidature refusée avec succès." });

  } catch (error) {
    console.error("Erreur refus candidature :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};





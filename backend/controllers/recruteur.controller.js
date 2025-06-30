import cloudinary from "../lib/cloudinary.js";
import Offre from "../models/offre.model.js";
import User from "../models/user.model.js";
import { sendNewOfferEmailToLaureat } from "../emails/emailHandlers.js";


// ✅ Créer une offre d'emploi
export const createOffer = async (req, res) => {
  try {
    const {
      titre,
      description,
      localisation,
      typeContrat,
      competencesRequises,
      dateExpiration,
      image,
    } = req.body;

    let imageUrl = null;
    let mediasUrls = [];

    if (req.files && req.files.image) {
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: "offres",
        width: 1000,
        height: 1000,
        crop: "limit"
      });
      imageUrl = result.secure_url;
    }

    if (req.files && req.files.medias) {
      const files = Array.isArray(req.files.medias) ? req.files.medias : [req.files.medias];
      for (const file of files) {
        const isVideo = file.mimetype.startsWith('video/');
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: "offres",
          resource_type: isVideo ? "video" : "image",
        });
        mediasUrls.push(result.secure_url);
      }
    }

    const newOffer = new Offre({
      author: req.user._id,
      titre,
      description,
      localisation,
      typeContrat,
      competencesRequises,
      dateExpiration,
      image: imageUrl,
      medias: mediasUrls,
    });

    await newOffer.save();

    // 🧠 Populate author pour l'email
    await newOffer.populate("author", "name companyName industry");

    // 📤 Envoyer l'offre à tous les lauréats
    const laureats = await User.find({ role: "user" });

    await Promise.all(
      laureats.map(laureat => sendNewOfferEmailToLaureat(laureat, newOffer)
      )
    );


    
    res.status(201).json({ message: "Offre créée avec succès", offer: newOffer });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
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
    // Offres du recruteur
    const offers = await Offre.find({ author: req.user._id });
    const totalOffers = offers.length;
    const activeOffers = offers.filter(o => !o.dateExpiration || new Date(o.dateExpiration) > new Date()).length;

    // Candidatures sur ses offres
    let totalApplications = 0;
    let pendingApplications = 0;
    offers.forEach(offer => {
      if (Array.isArray(offer.candidatures)) {
        totalApplications += offer.candidatures.length;
        pendingApplications += offer.candidatures.filter(c => c.status === 'pending').length;
      }
    });

    res.status(200).json({
      totalOffers,
      totalApplications,
      activeOffers,
      pendingApplications
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du calcul des statistiques", error: error.message });
  }
};

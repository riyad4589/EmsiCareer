import Offre from "../models/offre.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { uploadToAzure } from "../utils/azureBlob.js";
import Connection from "../models/connection.model.js";
import { sendNewCandidatureEmail } from "../emails/emailHandlers.js";



// ✅ Obtenir toutes les offres d'emploi (publique)
export const getAllOffers = async (req, res) => {
  try {
    const { page = 1, limit = 10, typeContrat, localisation } = req.query;
    
    let query = {};
    
    // Filtres optionnels
    if (typeContrat) {
      query.typeContrat = typeContrat;
    }
    if (localisation) {
      query.localisation = { $regex: localisation, $options: 'i' };
    }
    
    const offers = await Offre.find(query)
      .populate("author", "name companyName companyLogo")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Offre.countDocuments(query);
    
    res.status(200).json({
      offers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Obtenir une offre spécifique (publique)
export const getOfferById = async (req, res) => {
  try {
    const offer = await Offre.findById(req.params.id)
      .populate("author", "name companyName companyLogo industry description")
      .populate("comments.user", "name profilePicture")
      .populate("likes", "name profilePicture");
    
    if (!offer) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }
    
    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Liker une offre
export const likeOffer = async (req, res) => {
  try {
    const offer = await Offre.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }
    
    const alreadyLiked = offer.likes.includes(req.user._id);
    if (alreadyLiked) {
      return res.status(400).json({ message: "Vous avez déjà liké cette offre" });
    }
    
    offer.likes.push(req.user._id);
    await offer.save();
    
    res.status(200).json({ message: "Offre likée avec succès", offer });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Unliker une offre
export const unlikeOffer = async (req, res) => {
  try {
    const offer = await Offre.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }
    
    offer.likes = offer.likes.filter(
      like => like.toString() !== req.user._id.toString()
    );
    await offer.save();
    
    res.status(200).json({ message: "Like retiré avec succès", offer });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Ajouter un commentaire
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Le contenu du commentaire est requis" });
    }
    
    const offer = await Offre.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }
    
    offer.comments.push({
      user: req.user._id,
      content: content.trim()
    });
    
    await offer.save();
    
    // Populate le commentaire pour la réponse
    const populatedOffer = await Offre.findById(req.params.id)
      .populate("comments.user", "name profilePicture");
    
    res.status(201).json({ 
      message: "Commentaire ajouté avec succès", 
      offer: populatedOffer 
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Postuler à une offre

export const applyToOffer = async (req, res) => {
  try {
    // ✅ On récupère l'offre avec les infos nécessaires sur l'auteur
    const offer = await Offre.findById(req.params.id).populate("author", "name emailEdu emailPersonelle");
    if (!offer) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    // ✅ Vérifie si le lauréat a déjà postulé
    const alreadyApplied = offer.candidatures.some(
      (c) => c.laureat.toString() === req.user._id.toString()
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: "Vous avez déjà postulé à cette offre" });
    }

    // ✅ Empêche de postuler à sa propre offre
    if (offer.author._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Vous ne pouvez pas postuler à votre propre offre" });
    }

    let cvUrl = "";
    let lettreMotivationUrl = "";

    // ✅ Upload vers Azure
    if (req.files?.cv) {
      cvUrl = await uploadToAzure(req.files.cv.tempFilePath, req.files.cv.name);
    }

    if (req.files?.lettreMotivation) {
      lettreMotivationUrl = await uploadToAzure(
        req.files.lettreMotivation.tempFilePath,
        req.files.lettreMotivation.name
      );
    }

    // ✅ Ajout de la candidature
    offer.candidatures.push({
      laureat: req.user._id,
      cv: cvUrl,
      lettreMotivation: lettreMotivationUrl,
      datePostulation: new Date()
    });

    await offer.save();

    // ✅ Détermination de l'email du recruteur
    const recruteurEmail = offer.author.emailPersonelle;
    const recruteurNom = offer.author.name;

    // ✅ Envoi du mail de notification
    await sendNewCandidatureEmail({
      recruteurEmail,
      recruteurNom,
      laureatNom: req.user.name,
      offreTitre:  offer.titre, // selon le nom du champ réel
      cvUrl,
      lettreMotivationUrl
    });

    res.status(201).json({ message: "Candidature envoyée avec succès" });
  } catch (error) {
    console.error("Erreur postulation:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


export const getJobPostApplications = async (req, res) => {
  try {
    console.log("Récupération des candidatures pour l'offre:", req.params.id);
    console.log("Utilisateur connecté:", req.user._id);
    
    const offre = await Offre.findById(req.params.id).populate({
      path: "candidatures.laureat",
      select: "name email emailEdu"
    });
    
    if (!offre) {
      console.log("Offre non trouvée");
      return res.status(404).json({ message: "Offre non trouvée" });
    }
    
    console.log("Auteur de l'offre:", offre.author);
    console.log("Nombre de candidatures:", offre.candidatures?.length || 0);
    
    // Vérifier que l'utilisateur connecté est l'auteur de l'offre
    if (offre.author.toString() !== req.user._id.toString()) {
      console.log("Accès non autorisé - l'utilisateur n'est pas l'auteur");
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    
    console.log("Candidatures récupérées:", offre.candidatures);
    
    res.status(200).json({
      success: true,
      data: offre.candidatures || [],
      count: offre.candidatures?.length || 0
    });
  } catch (error) {
    console.error("Erreur dans getJobPostApplications:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const validateApplication = async (req, res) => {
  try {
    const { id, candidatureId } = req.params;
    const offre = await Offre.findById(id);
    if (!offre) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }
    // Vérifier que l'utilisateur connecté est bien le recruteur
    if (offre.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }
    // Trouver la candidature
    const candidature = offre.candidatures.id(candidatureId);
    if (!candidature) {
      return res.status(404).json({ message: "Candidature non trouvée" });
    }
    // Marquer la candidature comme validée (ajout d'un champ status si besoin)
    candidature.status = 'accepted';
    await offre.save();
    // Créer la connexion de messagerie si elle n'existe pas déjà
    const user1 = offre.author;
    const user2 = candidature.laureat;
    const existing = await Connection.findOne({
      $or: [
        { user1, user2 },
        { user1: user2, user2: user1 }
      ],
      status: 'accepted'
    });
    if (!existing) {
      await Connection.create({ user1, user2, status: 'accepted' });
    }
    res.status(200).json({ message: "Candidature validée et connexion de messagerie créée." });
  } catch (error) {
    console.error("Erreur validation candidature:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Mettre à jour une offre (recruteur)
export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, localisation, typeContrat, competencesRequises } = req.body;

    const offre = await Offre.findById(id);

    if (!offre) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    // Vérifier que l'utilisateur est bien l'auteur de l'offre
    if (offre.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    // Mettre à jour les champs
    offre.titre = titre || offre.titre;
    offre.description = description || offre.description;
    offre.localisation = localisation || offre.localisation;
    offre.typeContrat = typeContrat || offre.typeContrat;

    // Traiter les compétences pour s'assurer que c'est un tableau
    if (competencesRequises) {
      if (typeof competencesRequises === 'string') {
        offre.competencesRequises = competencesRequises.split(',').map(skill => skill.trim());
      } else if (Array.isArray(competencesRequises)) {
        offre.competencesRequises = competencesRequises;
      }
    }

    const updatedOffre = await offre.save();
    res.status(200).json({ message: "Offre mise à jour avec succès", data: updatedOffre });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Supprimer une offre (recruteur)
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const offre = await Offre.findById(id);

    if (!offre) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    // Vérifier que l'utilisateur est bien l'auteur de l'offre
    if (offre.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    await offre.deleteOne();
    res.status(200).json({ message: "Offre supprimée avec succès" });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

 
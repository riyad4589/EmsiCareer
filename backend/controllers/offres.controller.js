import Offre from "../models/offre.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { uploadToAzure } from "../utils/azureBlob.js";


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
    const offer = await Offre.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    const alreadyApplied = offer.candidatures.some(
      (c) => c.laureat.toString() === req.user._id.toString()
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: "Vous avez déjà postulé à cette offre" });
    }

    if (offer.author.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Vous ne pouvez pas postuler à votre propre offre" });
    }

    let cvUrl = "";
    let lettreMotivationUrl = "";

    // ✅ Upload CV vers Azure
    if (req.files?.cv) {
      cvUrl = await uploadToAzure(req.files.cv.tempFilePath, req.files.cv.name);
    }

    if (req.files?.lettreMotivation) {
      lettreMotivationUrl = await uploadToAzure(req.files.lettreMotivation.tempFilePath, req.files.lettreMotivation.name);


    }

    offer.candidatures.push({
      laureat: req.user._id,
      cv: cvUrl,
      lettreMotivation: lettreMotivationUrl,
      datePostulation: new Date()
    });

    await offer.save();

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

 
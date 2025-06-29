import User from "../models/user.model.js";

export const isRecruteur = async (req, res, next) => {
  try {
    // Vérifier si l'utilisateur existe et a le rôle recruteur
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (user.role !== "recruteur") {
      return res.status(403).json({ 
        message: "Accès refusé. Seuls les recruteurs peuvent accéder à cette ressource." 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la vérification du rôle", 
      error: error.message 
    });
  }
}; 
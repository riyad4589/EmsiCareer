import User from "../models/user.model.js";

export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user || user.role !== "admin") {
            return res.status(403).json({ 
                message: "Accès refusé. Droits d'administrateur requis." 
            });
        }

        next();
    } catch (error) {
        console.error("Error in isAdmin middleware:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}; 
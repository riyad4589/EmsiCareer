import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configuration Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration du stockage Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'offresmedias',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'limit' }],
    },
});

// Configuration de multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, cb) => {
        // Vérifier le type de fichier
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers image sont autorisés'), false);
        }
    },
});

export const uploadMedia = async (req, res) => {
    try {
        // Utiliser multer pour gérer l'upload
        upload.single('media')(req, res, async (err) => {
            if (err) {
                console.error('Erreur lors de l\'upload:', err);
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Erreur lors de l\'upload du fichier',
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Aucun fichier fourni',
                });
            }

            console.log('✅ Fichier uploadé avec succès:', req.file.filename);

            res.status(200).json({
                success: true,
                message: 'Média uploadé avec succès',
                url: req.file.path,
                filename: req.file.filename,
            });
        });
    } catch (error) {
        console.error('❌ Erreur dans uploadMedia:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne lors de l\'upload',
            details: error.message,
        });
    }
}; 
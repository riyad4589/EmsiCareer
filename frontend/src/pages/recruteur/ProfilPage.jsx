import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Edit, Save, X, Building, MapPin, Globe, Linkedin, Twitter, Facebook, User, Mail } from "lucide-react";

const ProfilPage = () => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);

    // Récupérer les données du profil
    const { data: profile, isLoading } = useQuery({
        queryKey: ["recruteurProfile"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/users/profile");
                return response.data;
            } catch (error) {
                console.error("Erreur lors de la récupération du profil:", error);
                return null;
            }
        }
    });

    // État local pour les données en cours d'édition
    const [editData, setEditData] = useState({
        name: "",
        username: "",
        emailEdu: "",
        emailPersonelle: "",
        headline: "",
        companyName: "",
        industry: "",
        description: "",
        website: "",
        location: "",
        socialLinks: {
            linkedin: "",
            twitter: "",
            facebook: ""
        }
    });

    // Initialiser les données d'édition quand le profil est chargé
    useEffect(() => {
        if (profile) {
            setEditData({
                name: profile.name || "",
                username: profile.username || "",
                emailEdu: profile.emailEdu || "",
                emailPersonelle: profile.emailPersonelle || "",
                headline: profile.headline || "",
                companyName: profile.companyName || "",
                industry: profile.industry || "",
                description: profile.description || "",
                website: profile.website || "",
                location: profile.location || "",
                socialLinks: {
                    linkedin: profile.socialLinks?.linkedin || "",
                    twitter: profile.socialLinks?.twitter || "",
                    facebook: profile.socialLinks?.facebook || ""
                }
            });
            setProfileImagePreview(profile.profilePicture || "/avatar.png");
        }
    }, [profile]);

    // Mutation pour mettre à jour le profil
    const updateProfileMutation = useMutation({
        mutationFn: (profileData) => axiosInstance.put("/users/profile", profileData),
        onSuccess: () => {
            queryClient.invalidateQueries(["recruteurProfile"]);
            toast.success("Profil mis à jour avec succès");
            setIsEditing(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du profil");
        }
    });

    const handleEdit = () => {
        setIsEditing(true);
        // Copier les données actuelles dans le formulaire d'édition
        setEditData({
            name: profile.name || "",
            username: profile.username || "",
            emailEdu: profile.emailEdu || "",
            emailPersonelle: profile.emailPersonelle || "",
            headline: profile.headline || "",
            companyName: profile.companyName || "",
            industry: profile.industry || "",
            description: profile.description || "",
            website: profile.website || "",
            location: profile.location || "",
            socialLinks: {
                linkedin: profile.socialLinks?.linkedin || "",
                twitter: profile.socialLinks?.twitter || "",
                facebook: profile.socialLinks?.facebook || ""
            }
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Restaurer les données originales
        setEditData({
            name: profile.name || "",
            username: profile.username || "",
            emailEdu: profile.emailEdu || "",
            emailPersonelle: profile.emailPersonelle || "",
            headline: profile.headline || "",
            companyName: profile.companyName || "",
            industry: profile.industry || "",
            description: profile.description || "",
            website: profile.website || "",
            location: profile.location || "",
            socialLinks: {
                linkedin: profile.socialLinks?.linkedin || "",
                twitter: profile.socialLinks?.twitter || "",
                facebook: profile.socialLinks?.facebook || ""
            }
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setProfileImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!editData.name || !editData.companyName || !editData.industry || !editData.description || !editData.location) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(editData).forEach(([key, value]) => {
                if (typeof value === "object" && value !== null) {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value);
                }
            });
            if (profileImage) {
                formData.append("profilePicture", profileImage);
            }
            await updateProfileMutation.mutateAsync(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-500">Erreur lors du chargement du profil</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* En-tête du profil */}
                <div className="relative h-48 bg-gradient-to-r from-green-600 to-green-800">
                    <div className="absolute bottom-4 left-6 flex items-end space-x-4">
                        <div className="relative">
                            <img
                                src={ profile.companyLogo || "/avatar.png"}
                                alt="Photo de profil"
                                className="w-24 h-24 rounded-full border-4 border-white object-cover"
                            />
                            {isEditing && (
                                <label className="absolute bottom-0 right-0 bg-green-600 text-white p-1 rounded-full hover:bg-green-700 cursor-pointer">
                                    <Edit size={16} />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                        <div className="text-white mb-2">
                            <h1 className="text-2xl font-bold">{profile.name}</h1>
                            <p className="text-green-100">{profile.headline || "Recruteur"}</p>
                        </div>
                    </div>
                    
                    {/* Bouton Modifier */}
                    <div className="absolute top-4 right-4">
                        {!isEditing ? (
                            <button
                                onClick={handleEdit}
                                className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier le profil
                            </button>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleCancel}
                                    className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contenu du profil */}
                <div className="p-6">
                    {isEditing ? (
                        // Formulaire d'édition
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Informations personnelles */}
                            <div className="border-b border-gray-200 pb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations personnelles</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom complet *
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            value={editData.name}
                                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom d'utilisateur
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                                            value={editData.username}
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email académique
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                                            value={editData.emailEdu}
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email personnelle
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            value={editData.emailPersonelle}
                                            onChange={e => setEditData({ ...editData, emailPersonelle: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Titre professionnel
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        value={editData.headline}
                                        onChange={e => setEditData({ ...editData, headline: e.target.value })}
                                        placeholder="Ex: Responsable RH, Directeur de recrutement"
                                    />
                                </div>
                            </div>

                            {/* Informations de l'entreprise */}
                            <div className="border-b border-gray-200 pb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations de l'entreprise</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom de l'entreprise *
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            value={editData.companyName}
                                            onChange={e => setEditData({ ...editData, companyName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Secteur d'activité *
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            value={editData.industry}
                                            onChange={e => setEditData({ ...editData, industry: e.target.value })}
                                            placeholder="Ex: Technologies, Finance, Santé"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Localisation *
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            value={editData.location}
                                            onChange={e => setEditData({ ...editData, location: e.target.value })}
                                            placeholder="Ex: Paris, France"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Site web
                                        </label>
                                        <input
                                            type="url"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            value={editData.website}
                                            onChange={e => setEditData({ ...editData, website: e.target.value })}
                                            placeholder="https://www.votre-entreprise.com"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description de l'entreprise *
                                    </label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        rows={4}
                                        value={editData.description}
                                        onChange={e => setEditData({ ...editData, description: e.target.value })}
                                        placeholder="Décrivez votre entreprise, sa mission, ses valeurs..."
                                        required
                                    />
                                </div>
                            </div>

                            {/* Réseaux sociaux */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Réseaux sociaux</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            LinkedIn
                                        </label>
                                        <input
                                            type="url"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            value={editData.socialLinks.linkedin}
                                            onChange={e => setEditData({
                                                ...editData,
                                                socialLinks: { ...editData.socialLinks, linkedin: e.target.value }
                                            })}
                                            placeholder="https://linkedin.com/in/votre-profil"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Twitter
                                        </label>
                                        <input
                                            type="url"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            value={editData.socialLinks.twitter}
                                            onChange={e => setEditData({
                                                ...editData,
                                                socialLinks: { ...editData.socialLinks, twitter: e.target.value }
                                            })}
                                            placeholder="https://twitter.com/votre-compte"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Facebook
                                        </label>
                                        <input
                                            type="url"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            value={editData.socialLinks.facebook}
                                            onChange={e => setEditData({
                                                ...editData,
                                                socialLinks: { ...editData.socialLinks, facebook: e.target.value }
                                            })}
                                            placeholder="https://facebook.com/votre-page"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (
                        // Affichage en lecture seule
                        <div className="space-y-6">
                            {/* Informations personnelles */}
                            <div className="border-b border-gray-200 pb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations personnelles</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3">
                                        <User className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Nom complet</p>
                                            <p className="font-medium">{profile.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <User className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Nom d'utilisateur</p>
                                            <p className="font-medium">@{profile.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Email académique</p>
                                            <p className="font-medium">{profile.emailEdu}</p>
                                        </div>
                                    </div>
                                    {profile.emailPersonelle && (
                                        <div className="flex items-center space-x-3">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Email personnelle</p>
                                                <p className="font-medium">{profile.emailPersonelle}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {profile.headline && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500">Titre professionnel</p>
                                        <p className="font-medium">{profile.headline}</p>
                                    </div>
                                )}
                            </div>

                            {/* Informations de l'entreprise */}
                            <div className="border-b border-gray-200 pb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations de l'entreprise</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3">
                                        <Building className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Entreprise</p>
                                            <p className="font-medium">{profile.companyName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Building className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Secteur d'activité</p>
                                            <p className="font-medium">{profile.industry}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Localisation</p>
                                            <p className="font-medium">{profile.location}</p>
                                        </div>
                                    </div>
                                    {profile.website && (
                                        <div className="flex items-center space-x-3">
                                            <Globe className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Site web</p>
                                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="font-medium text-green-600 hover:underline">
                                                    {profile.website}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {profile.description && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500">Description de l'entreprise</p>
                                        <p className="font-medium">{profile.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Réseaux sociaux */}
                            {(profile.socialLinks?.linkedin || profile.socialLinks?.twitter || profile.socialLinks?.facebook) && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Réseaux sociaux</h2>
                                    <div className="flex space-x-4">
                                        {profile.socialLinks?.linkedin && (
                                            <a
                                                href={profile.socialLinks.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-2 text-green-600 hover:text-green-800"
                                            >
                                                <Linkedin className="w-5 h-5" />
                                                <span>LinkedIn</span>
                                            </a>
                                        )}
                                        {profile.socialLinks?.twitter && (
                                            <a
                                                href={profile.socialLinks.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-2 text-green-400 hover:text-green-600"
                                            >
                                                <Twitter className="w-5 h-5" />
                                                <span>Twitter</span>
                                            </a>
                                        )}
                                        {profile.socialLinks?.facebook && (
                                            <a
                                                href={profile.socialLinks.facebook}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-2 text-green-600 hover:text-green-800"
                                            >
                                                <Facebook className="w-5 h-5" />
                                                <span>Facebook</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilPage; 
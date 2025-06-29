import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Plus, X, MapPin, Calendar, Briefcase, Trash2, Edit, Users, CheckCircle, XCircle, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { getDownloadUrl } from "../../utils/cloudinary";

const OffresPage = () => {
    const queryClient = useQueryClient();
    
    const { data: offres, isLoading } = useQuery({
        queryKey: ["recruteurOffres"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/recruteur/offres");
                return response.data;
            } catch (error) {
                console.error("Erreur lors de la récupération des offres:", error);
                return [];
            }
        }
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [newOffer, setNewOffer] = useState({
        titre: "",
        description: "",
        localisation: "",
        typeContrat: "CDI",
        competencesRequises: [],
        dateExpiration: "",
        image: ""
    });
    const [newCompetence, setNewCompetence] = useState("");
    const [editCompetence, setEditCompetence] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [mediaPreviews, setMediaPreviews] = useState([]);
    const [mediaTypes, setMediaTypes] = useState([]);
    const [editMediaFile, setEditMediaFile] = useState(null);
    const [editMediaPreview, setEditMediaPreview] = useState(null);
    const [editMediaType, setEditMediaType] = useState(null);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [applications, setApplications] = useState([]);
    const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
    const [loadingApplications, setLoadingApplications] = useState(false);
    const [applicationsError, setApplicationsError] = useState("");

    // Fonction pour forcer le téléchargement depuis Cloudinary
    const downloadFile = async (url, filename) => {
        try {
            console.log('Tentative de téléchargement:', url);
            
            // Essayer d'abord avec fetch
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/pdf,application/octet-stream,*/*'
                }
            });
            
            console.log('Réponse fetch:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            console.log('Blob créé:', blob.size, 'bytes');
            
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            
            toast.success('Téléchargement en cours...');
        } catch (error) {
            console.error('Erreur de téléchargement détaillée:', error);
            
            // Fallback: ouvrir dans un nouvel onglet
            try {
                console.log('Tentative de fallback avec window.open');
                window.open(url, '_blank');
                toast.success('Fichier ouvert dans un nouvel onglet. Utilisez Ctrl+S pour le sauvegarder.');
            } catch (fallbackError) {
                console.error('Erreur fallback:', fallbackError);
                toast.error(`Erreur lors du téléchargement: ${error.message}`);
            }
        }
    };

    const createOfferMutation = useMutation({
        mutationFn: (offerData) => axiosInstance.post("/recruteur/offres", offerData),
        onSuccess: () => {
            queryClient.invalidateQueries(["recruteurOffres"]);
            toast.success("Offre créée avec succès");
            setIsModalOpen(false);
            setNewOffer({
                titre: "",
                description: "",
                localisation: "",
                typeContrat: "CDI",
                competencesRequises: [],
                dateExpiration: "",
                image: ""
            });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Erreur lors de la création de l'offre");
        }
    });

    const updateOfferMutation = useMutation({
        mutationFn: ({ offerId, offerData }) => axiosInstance.put(`/recruteur/offres/${offerId}`, offerData),
        onSuccess: () => {
            queryClient.invalidateQueries(["recruteurOffres"]);
            toast.success("Offre modifiée avec succès");
            setIsEditModalOpen(false);
            setEditingOffer(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Erreur lors de la modification de l'offre");
        }
    });

    const deleteOfferMutation = useMutation({
        mutationFn: (offerId) => axiosInstance.delete(`/recruteur/offres/${offerId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(["recruteurOffres"]);
            toast.success("Offre supprimée avec succès");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Erreur lors de la suppression de l'offre");
        }
    });

    const handleAddCompetence = () => {
        if (newCompetence.trim() && !newOffer.competencesRequises.includes(newCompetence.trim())) {
            setNewOffer(prev => ({
                ...prev,
                competencesRequises: [...prev.competencesRequises, newCompetence.trim()]
            }));
            setNewCompetence("");
        }
    };

    const handleRemoveCompetence = (index) => {
        setNewOffer(prev => ({
            ...prev,
            competencesRequises: prev.competencesRequises.filter((_, i) => i !== index)
        }));
    };

    const handleAddEditCompetence = () => {
        if (editCompetence.trim() && !editingOffer.competencesRequises.includes(editCompetence.trim())) {
            setEditingOffer(prev => ({
                ...prev,
                competencesRequises: [...prev.competencesRequises, editCompetence.trim()]
            }));
            setEditCompetence("");
        }
    };

    const handleRemoveEditCompetence = (index) => {
        setEditingOffer(prev => ({
            ...prev,
            competencesRequises: prev.competencesRequises.filter((_, i) => i !== index)
        }));
    };

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        const previews = [];
        const types = [];
        files.forEach(file => {
            types.push(file.type.startsWith('video/') ? 'video' : 'image');
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
        setMediaFiles(prev => [...prev, ...files]);
        setMediaTypes(prev => [...prev, ...types]);
    };

    const handleRemoveMedia = (index) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
        setMediaPreviews(prev => prev.filter((_, i) => i !== index));
        setMediaTypes(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreateOffer = async (e) => {
        e.preventDefault();
        if (!newOffer.titre || !newOffer.description || !newOffer.localisation || !newOffer.dateExpiration) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("titre", newOffer.titre);
            formData.append("description", newOffer.description);
            formData.append("localisation", newOffer.localisation);
            formData.append("typeContrat", newOffer.typeContrat);
            formData.append("dateExpiration", newOffer.dateExpiration);
            formData.append("competencesRequises", JSON.stringify(newOffer.competencesRequises));
            if (mediaFiles.length > 0) {
                mediaFiles.forEach((file) => {
                    formData.append("medias", file);
                });
            }
            await createOfferMutation.mutateAsync(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditOffer = async (e) => {
        e.preventDefault();
        
        if (!editingOffer.titre || !editingOffer.description || !editingOffer.localisation || !editingOffer.dateExpiration) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        setIsEditing(true);
        try {
            const formData = new FormData();
            formData.append("titre", editingOffer.titre);
            formData.append("description", editingOffer.description);
            formData.append("localisation", editingOffer.localisation);
            formData.append("typeContrat", editingOffer.typeContrat);
            formData.append("dateExpiration", editingOffer.dateExpiration);
            formData.append("competencesRequises", JSON.stringify(editingOffer.competencesRequises));
            if (editMediaFile) formData.append("image", editMediaFile);
            await updateOfferMutation.mutateAsync({
                offerId: editingOffer._id,
                offerData: formData
            });
        } finally {
            setIsEditing(false);
        }
    };

    const handleDeleteOffer = async (offerId, offerTitle) => {
        const confirmed = window.confirm(
            `Êtes-vous sûr de vouloir supprimer l'offre "${offerTitle}" ?\n\nCette action est irréversible.`
        );
        
        if (confirmed) {
            deleteOfferMutation.mutate(offerId);
        }
    };

    const openEditModal = (offre) => {
        setEditingOffer({
            ...offre,
            competencesRequises: [...(offre.competencesRequises || [])]
        });
        setIsEditModalOpen(true);
    };

    const openApplicationsModal = async (offre) => {
        console.log("Ouverture de la modale pour l'offre:", offre._id);
        setSelectedOffer(offre);
        setIsApplicationsModalOpen(true);
        setLoadingApplications(true);
        setApplicationsError("");
        try {
            console.log("Appel API pour récupérer les candidatures...");
            const res = await axiosInstance.get(`/offres/${offre._id}/applications`);
            console.log("Réponse API:", res.data);
            
            // Gérer la nouvelle structure de réponse
            const candidatures = res.data.data || res.data.applications || res.data;
            console.log("Candidatures extraites:", candidatures);
            
            setApplications(candidatures);
            
            if (!candidatures || candidatures.length === 0) {
                setApplicationsError("Aucune candidature trouvée pour cette offre.");
            }
        } catch (e) {
            console.error("Erreur lors de la récupération des candidatures:", e);
            console.error("Détails de l'erreur:", e.response?.data);
            setApplications([]);
            
            if (e.response?.status === 403) {
                setApplicationsError("Vous n'êtes pas autorisé à voir les candidatures de cette offre.");
            } else if (e.response?.status === 404) {
                setApplicationsError("Offre non trouvée.");
            } else {
                setApplicationsError(`Erreur lors de la récupération des candidatures (${e.response?.status || "?"}): ${e.response?.data?.message || e.message}`);
            }
        }
        setLoadingApplications(false);
    };

    const closeApplicationsModal = () => {
        setIsApplicationsModalOpen(false);
        setSelectedOffer(null);
        setApplications([]);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Mes offres d'emploi</h1>
                <button
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Nouvelle offre
                </button>
            </div>

            {/* Modale de création d'offre */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold mb-6">Créer une nouvelle offre d'emploi</h2>
                        <form onSubmit={handleCreateOffer} className="space-y-6">
                            {/* Titre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Titre du poste *
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={newOffer.titre}
                                    onChange={e => setNewOffer({ ...newOffer, titre: e.target.value })}
                                    placeholder="Ex: Développeur Full Stack"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description du poste *
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={newOffer.description}
                                    onChange={e => setNewOffer({ ...newOffer, description: e.target.value })}
                                    rows={4}
                                    placeholder="Décrivez le poste, les responsabilités, l'environnement de travail..."
                                    required
                                />
                            </div>

                            {/* Localisation et Type de contrat */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Localisation *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={newOffer.localisation}
                                        onChange={e => setNewOffer({ ...newOffer, localisation: e.target.value })}
                                        placeholder="Ex: Paris, France"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type de contrat
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={newOffer.typeContrat}
                                        onChange={e => setNewOffer({ ...newOffer, typeContrat: e.target.value })}
                                    >
                                        <option value="CDI">CDI</option>
                                        <option value="CDD">CDD</option>
                                        <option value="Stage">Stage</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Alternance">Alternance</option>
                                    </select>
                                </div>
                            </div>

                            {/* Date d'expiration */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date d'expiration *
                                </label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={newOffer.dateExpiration}
                                    onChange={e => setNewOffer({ ...newOffer, dateExpiration: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            {/* Compétences requises */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Compétences requises
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={newCompetence}
                                        onChange={e => setNewCompetence(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddCompetence())}
                                        placeholder="Ajouter une compétence"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCompetence}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        +
                                    </button>
                                </div>
                                {newOffer.competencesRequises.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {newOffer.competencesRequises.map((comp, index) => (
                                            <span key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                                {comp}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCompetence(index)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Médias (optionnel) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Médias (images, gifs ou vidéos, optionnel)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    onChange={handleMediaChange}
                                />
                                {mediaPreviews.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-4">
                                        {mediaPreviews.map((preview, idx) => (
                                            <div key={idx} className="relative group">
                                                <button
                                                    type="button"
                                                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow group-hover:bg-red-100"
                                                    onClick={() => handleRemoveMedia(idx)}
                                                    title="Supprimer ce média"
                                                >
                                                    <X className="w-5 h-5 text-red-600" />
                                                </button>
                                                {mediaTypes[idx] === 'video' ? (
                                                    <video src={preview} controls className="w-48 h-32 object-cover rounded" />
                                                ) : (
                                                    <img src={preview} alt="Aperçu" className="w-32 h-32 object-cover rounded" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Boutons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Création..." : "Créer l'offre"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modale de modification d'offre */}
            {isEditModalOpen && editingOffer && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            onClick={() => {
                                setIsEditModalOpen(false);
                                setEditingOffer(null);
                            }}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold mb-6">Modifier l'offre d'emploi</h2>
                        <form onSubmit={handleEditOffer} className="space-y-6">
                            {/* Titre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Titre du poste *
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={editingOffer.titre}
                                    onChange={e => setEditingOffer({ ...editingOffer, titre: e.target.value })}
                                    placeholder="Ex: Développeur Full Stack"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description du poste *
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={editingOffer.description}
                                    onChange={e => setEditingOffer({ ...editingOffer, description: e.target.value })}
                                    rows={4}
                                    placeholder="Décrivez le poste, les responsabilités, l'environnement de travail..."
                                    required
                                />
                            </div>

                            {/* Localisation et Type de contrat */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Localisation *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingOffer.localisation}
                                        onChange={e => setEditingOffer({ ...editingOffer, localisation: e.target.value })}
                                        placeholder="Ex: Paris, France"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type de contrat
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingOffer.typeContrat}
                                        onChange={e => setEditingOffer({ ...editingOffer, typeContrat: e.target.value })}
                                    >
                                        <option value="CDI">CDI</option>
                                        <option value="CDD">CDD</option>
                                        <option value="Stage">Stage</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Alternance">Alternance</option>
                                    </select>
                                </div>
                            </div>

                            {/* Date d'expiration */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date d'expiration *
                                </label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={editingOffer.dateExpiration}
                                    onChange={e => setEditingOffer({ ...editingOffer, dateExpiration: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            {/* Compétences requises */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Compétences requises
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editCompetence}
                                        onChange={e => setEditCompetence(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddEditCompetence())}
                                        placeholder="Ajouter une compétence"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddEditCompetence}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        +
                                    </button>
                                </div>
                                {editingOffer.competencesRequises.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {editingOffer.competencesRequises.map((comp, index) => (
                                            <span key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                                {comp}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEditCompetence(index)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Média (optionnel) pour modification */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Média (image, gif ou vidéo, optionnel)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        setEditMediaFile(file);
                                        if (file) {
                                            setEditMediaType(file.type.startsWith('video/') ? 'video' : 'image');
                                            const reader = new FileReader();
                                            reader.onloadend = () => setEditMediaPreview(reader.result);
                                            reader.readAsDataURL(file);
                                        } else {
                                            setEditMediaPreview(null);
                                            setEditMediaType(null);
                                        }
                                    }}
                                />
                                {/* Aperçu du média sélectionné pour modification */}
                                {editMediaPreview ? (
                                    <div className="mt-2 flex items-center gap-4">
                                        {editMediaType === 'video' ? (
                                            <video src={editMediaPreview} controls className="w-48 h-32 object-cover rounded" />
                                        ) : (
                                            <img src={editMediaPreview} alt="Aperçu" className="w-32 h-32 object-cover rounded" />
                                        )}
                                        <button
                                            type="button"
                                            className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                            onClick={() => {
                                                setEditMediaFile(null);
                                                setEditMediaPreview(null);
                                                setEditMediaType(null);
                                            }}
                                        >
                                            Supprimer le média
                                        </button>
                                    </div>
                                ) : (
                                    editingOffer.image && (
                                        <div className="mt-2 flex items-center gap-4">
                                            {editingOffer.image.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                                <video src={editingOffer.image} controls className="w-48 h-32 object-cover rounded" />
                                            ) : (
                                                <img src={editingOffer.image} alt="Aperçu" className="w-32 h-32 object-cover rounded" />
                                            )}
                                            <button
                                                type="button"
                                                className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                onClick={() => setEditingOffer({ ...editingOffer, image: "" })}
                                            >
                                                Supprimer le média
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Boutons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingOffer(null);
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    disabled={isEditing}
                                >
                                    {isEditing ? "Modification..." : "Modifier l'offre"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Liste des offres */}
            <div className="flex flex-col gap-8 mt-8">
                {offres && offres.length > 0 ? (
                    offres.map((offre) => (
                        <div key={offre._id} className="relative group">
                            <div
                                className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-full cursor-pointer hover:shadow-2xl transition-shadow w-full"
                                onClick={() => openApplicationsModal(offre)}
                            >
                                <div className="flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900">{offre.titre}</h3>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                            {offre.typeContrat}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={16} />
                                            {offre.localisation}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={16} />
                                            Expire le {new Date(offre.dateExpiration).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users size={16} />
                                            {offre.candidatures?.length || 0} candidature(s)
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mb-3 line-clamp-4">{offre.description}</p>
                                    {offre.competencesRequises?.length > 0 && (
                                        <div className="mb-3">
                                            <span className="text-sm font-medium text-gray-700">Compétences requises :</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {offre.competencesRequises.map((comp, index) => (
                                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                        {comp}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Galerie de médias */}
                                    {offre.medias && offre.medias.length > 0 && (
                                        <div className="mb-4 flex gap-4 flex-wrap">
                                            {offre.medias.map((mediaUrl, idx) => (
                                                <div key={idx} className="">
                                                    {mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                                        <video src={mediaUrl} controls className="w-48 h-32 object-cover rounded" />
                                                    ) : (
                                                        <img src={mediaUrl} alt="Média de l'offre" className="w-32 h-32 object-cover rounded" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Boutons d'action, positionnés en haut à droite, non cliquables sur la carte */}
                            <div className="absolute top-2 right-2 flex flex-row gap-2 z-10">
                                <button
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Modifier l'offre"
                                    onClick={e => { e.stopPropagation(); openEditModal(offre); }}
                                    disabled={updateOfferMutation.isPending}
                                >
                                    {updateOfferMutation.isPending ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    ) : (
                                        <Edit size={18} />
                                    )}
                                </button>
                                <button
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer l'offre"
                                    onClick={e => { e.stopPropagation(); handleDeleteOffer(offre._id, offre.titre); }}
                                    disabled={deleteOfferMutation.isPending}
                                >
                                    {deleteOfferMutation.isPending ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                    ) : (
                                        <Trash2 size={18} />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500 col-span-full">
                        <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">Aucune offre d'emploi</p>
                        <p className="text-sm">Créez votre première offre d'emploi pour commencer à recruter</p>
                    </div>
                )}
            </div>

            {isApplicationsModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                        <h2 className="text-xl font-bold mb-4">Candidatures pour : {selectedOffer?.titre}</h2>
                        {loadingApplications ? (
                            <div className="text-center py-8">Chargement...</div>
                        ) : applicationsError ? (
                            <div className="text-center py-8 text-red-500">{applicationsError}</div>
                        ) : applications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">Aucune postulation pour cette offre</div>
                        ) : (
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                {applications.map((candidature, idx) => (
                                    <div key={candidature._id || idx} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4 bg-gray-50">
                                        <div className="flex-1">
                                            <div className="font-semibold text-blue-800">{candidature.laureat?.name || 'Utilisateur'}</div>
                                            <div className="text-xs text-gray-500 mb-2">{candidature.laureat?.emailEdu}</div>
                                            <div className="flex gap-2 mb-1">
                                                {candidature.cv && (
                                                    <button
                                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                        onClick={(e) => { e.stopPropagation(); downloadFile(candidature.cv, 'CV.pdf'); }}
                                                    >
                                                        <Eye size={14} />
                                                        Voir le CV
                                                    </button>
                                                )}
                                                {candidature.lettreMotivation && (
                                                    <button
                                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                        onClick={(e) => { e.stopPropagation(); downloadFile(candidature.lettreMotivation, 'Lettre de motivation.pdf'); }}
                                                    >
                                                        <Eye size={14} />
                                                        Voir La Lettre De Motivation
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="flex items-center gap-2 px-5 py-2 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 hover:scale-105 transition-all duration-150 font-semibold text-base"
                                                onClick={() => {/* Action Valider ici */}}
                                            >
                                                <CheckCircle className="w-5 h-5" /> Valider
                                            </button>
                                            <button
                                                className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 hover:scale-105 transition-all duration-150 font-semibold text-base"
                                                onClick={() => {/* Action Refuser ici */}}
                                            >
                                                <XCircle className="w-5 h-5" /> Refuser
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-600 text-2xl"
                            onClick={closeApplicationsModal}
                            title="Fermer"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OffresPage; 
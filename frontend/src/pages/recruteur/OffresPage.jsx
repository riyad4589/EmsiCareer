import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Plus, X, MapPin, Calendar, Briefcase, Trash2, Edit, Users, CheckCircle, XCircle, Download, Eye } from "lucide-react";
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

    // Mutation pour valider une candidature
    const acceptApplicationMutation = useMutation({
        mutationFn: ({ offerId, applicationId }) => 
            axiosInstance.put(`/recruteur/offres/${offerId}/candidatures/${applicationId}/accept`),
        onSuccess: (data, variables) => {
            toast.success("Candidature validée !");
            // Mettre à jour la liste des candidatures dans l'état local
            setApplications(prev => prev.map(app => 
                app._id === variables.applicationId ? { ...app, status: 'accepted' } : app
            ));
            queryClient.invalidateQueries(["recruteurOffres"]);
            queryClient.invalidateQueries(["recruiterStats"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Erreur lors de la validation");
        }
    });

    // Mutation pour refuser une candidature
    const rejectApplicationMutation = useMutation({
        mutationFn: ({ offerId, applicationId }) => 
            axiosInstance.delete(`/recruteur/offres/${offerId}/candidatures/${applicationId}/reject`),
        onSuccess: (data, variables) => {
            toast.success("Candidature refusée.");
            // Retirer la candidature de l'état local
            setApplications(prev => prev.filter(app => app._id !== variables.applicationId));
            queryClient.invalidateQueries(["recruteurOffres"]);
            queryClient.invalidateQueries(["recruiterStats"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Erreur lors du refus");
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
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Mes Offres d'Emploi</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition flex items-center"
                >
                    <Plus className="mr-2" /> Créer une offre
                </button>
            </div>

            {/* Modal de création d'offre */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Créer une nouvelle offre</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateOffer} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Titre de l'offre"
                                value={newOffer.titre}
                                onChange={(e) => setNewOffer({ ...newOffer, titre: e.target.value })}
                                className="w-full p-3 border rounded-lg"
                            />
                            <textarea
                                placeholder="Description de l'offre"
                                value={newOffer.description}
                                onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                                className="w-full p-3 border rounded-lg h-32"
                            />
                            <div className="flex space-x-4">
                                <input
                                    type="text"
                                    placeholder="Localisation"
                                    value={newOffer.localisation}
                                    onChange={(e) => setNewOffer({ ...newOffer, localisation: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                />
                                <select
                                    value={newOffer.typeContrat}
                                    onChange={(e) => setNewOffer({ ...newOffer, typeContrat: e.target.value })}
                                    className="w-full p-3 border rounded-lg bg-white"
                                >
                                    <option>CDI</option>
                                    <option>CDD</option>
                                    <option>Stage</option>
                                    <option>Alternance</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
                                <input
                                    type="date"
                                    value={newOffer.dateExpiration}
                                    onChange={(e) => setNewOffer({ ...newOffer, dateExpiration: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Compétences requises</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Ajouter une compétence"
                                        value={newCompetence}
                                        onChange={(e) => setNewCompetence(e.target.value)}
                                        className="w-full p-3 border rounded-lg"
                                    />
                                    <button type="button" onClick={handleAddCompetence} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Ajouter</button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {newOffer.competencesRequises.map((c, index) => (
                                        <div key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
                                            {c}
                                            <button type="button" onClick={() => handleRemoveCompetence(index)} className="ml-2 text-red-500">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter des médias (images, vidéos)</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={handleMediaChange}
                                    className="w-full p-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                />
                                <div className="flex flex-wrap gap-4 mt-4">
                                    {mediaPreviews.map((preview, index) => (
                                        <div key={index} className="relative">
                                            {mediaTypes[index] === 'video' ? (
                                                <video src={preview} controls className="w-32 h-32 object-cover rounded-lg" />
                                            ) : (
                                                <img src={preview} alt="Aperçu" className="w-32 h-32 object-cover rounded-lg" />
                                            )}
                                            <button type="button" onClick={() => handleRemoveMedia(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="mr-4 px-6 py-2 rounded-lg border">Annuler</button>
                                <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                                    {isSubmitting ? 'Création...' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="text-center">Chargement des offres...</div>
            ) : (
                <div className="space-y-6">
                    {offres.map(offre => (
                        <div
                            key={offre._id}
                            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
                            onClick={() => openApplicationsModal(offre)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{offre.titre}</h2>
                                    <div className="flex items-center text-gray-500 mt-2 space-x-4">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                            {offre.typeContrat}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
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
                    ))}
                </div>
            )}

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
                                {applications.map((application, idx) => (
                                    <div key={application._id || idx} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4 bg-gray-50">
                                        <div className="flex-1">
                                            <div className="font-semibold text-blue-800">{application.laureat?.name || 'Utilisateur'}</div>
                                            <div className="text-xs text-gray-500 mb-2">{application.laureat?.emailEdu}</div>
                                            <div className="flex gap-2 mb-1">
                                                {application.cv && (
                                                    <button
                                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                        onClick={(e) => { e.stopPropagation(); downloadFile(application.cv, 'CV.pdf'); }}
                                                    >
                                                        <Eye size={14} />
                                                        Voir le CV
                                                    </button>
                                                )}
                                                {application.lettreMotivation && (
                                                    <button
                                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                        onClick={(e) => { e.stopPropagation(); downloadFile(application.lettreMotivation, 'Lettre de motivation.pdf'); }}
                                                    >
                                                        <Eye size={14} />
                                                        Voir La Lettre De Motivation
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {application.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => acceptApplicationMutation.mutate({ offerId: selectedOffer._id, applicationId: application._id })}
                                                        disabled={acceptApplicationMutation.isLoading}
                                                        className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                                                    >
                                                        <CheckCircle className="inline h-4 w-4 mr-1" />
                                                        Valider
                                                    </button>
                                                    <button 
                                                        onClick={() => rejectApplicationMutation.mutate({ offerId: selectedOffer._id, applicationId: application._id })}
                                                        disabled={rejectApplicationMutation.isLoading}
                                                        className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                                                    >
                                                        <XCircle className="inline h-4 w-4 mr-1" />
                                                        Refuser
                                                    </button>
                                                </>
                                            )}
                                            {application.status === 'accepted' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Validée
                                                </span>
                                            )}
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
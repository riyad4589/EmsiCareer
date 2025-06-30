import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Plus, X, MapPin, Calendar, Briefcase, Trash2, Edit, Users, CheckCircle, XCircle, Download, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

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
        const imageFiles = files.filter(file => file.type.startsWith("image/"));

        if (imageFiles.length === 0) {
            toast.error("Seules les images sont autorisées.");
            return;
        }

        const types = [];

        imageFiles.forEach(file => {
            types.push("image");
            const reader = new FileReader();
            reader.onloadend = () => {
            setMediaPreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });

        setMediaFiles(prev => [...prev, ...imageFiles]);
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
                mediaFiles.forEach(file => {
                    formData.append('medias', file); // ✅ au pluriel, pour correspondre à req.files.medias
                });
            }
            await createOfferMutation.mutateAsync(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditOffer = async (e) => {
        e.preventDefault();
        setIsEditing(true);

        const dataToUpdate = {
            ...editingOffer,
            competencesRequises: Array.isArray(editingOffer.competencesRequises) 
                ? editingOffer.competencesRequises 
                : editingOffer.competencesRequises.split(',').map(s => s.trim())
        };

        try {
            await updateOfferMutation.mutateAsync({
                offerId: editingOffer._id,
                offerData: dataToUpdate
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
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
                                    <button type="button" onClick={handleAddCompetence} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Ajouter</button>
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
                                    accept="image/*"
                                    onChange={handleMediaChange}
                                />
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
                    <div className="flex flex-col gap-6">
                        {offres && offres.length > 0 ? (
                            offres.map((offre) => (
                                <div key={offre._id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col sm:flex-row transform hover:-translate-y-1 transition-transform duration-300">
                                {offre.medias?.length > 0 ? (
                                offre.medias[0].includes(".mp4") || offre.medias[0].includes("video") ? (
                                    <video
                                    src={offre.medias[0]}
                                    controls
                                    className="w-full sm:w-48 h-48 sm:h-auto object-cover"
                                    />
                                ) : (
                                    <img
                                    src={offre.medias[0]}
                                    alt={offre.titre}
                                    className="w-full sm:w-48 h-48 sm:h-auto object-cover"
                                    />
                                )
                                ) : (
                                <img
                                    src="/placeholder-offre.png"
                                    alt="Image indisponible"
                                    className="w-full sm:w-48 h-48 sm:h-auto object-cover opacity-40"
                                />
                                )}
                                    <div className="p-5 flex flex-col justify-between flex-grow">
                                        <div>
                                            <h3 className="font-bold text-xl mb-2 text-gray-800">{offre.titre}</h3>
                                            <p className="text-gray-600 text-sm mb-1 flex items-center gap-2"><Briefcase size={14}/> {offre.typeContrat}</p>
                                            <p className="text-gray-600 text-sm mb-1 flex items-center gap-2"><MapPin size={14}/> {offre.localisation}</p>
                                            <p className="text-gray-500 text-xs mb-3">Expire le: {new Date(offre.dateExpiration).toLocaleDateString()}</p>
                                            
                                            <div className="mb-3">
                                                <p className="font-semibold text-sm">Compétences :</p>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {offre.competencesRequises?.map((comp, idx) => (
                                                        <span key={idx} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{comp}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-between items-center">
                                            <button
                                                onClick={() => openApplicationsModal(offre)}
                                                className="text-sm bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                                            >
                                                <Users size={16} /> Voir les candidatures ({offre.candidatures?.length || 0})
                                            </button>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(offre)}
                                                    className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                                                    aria-label="Modifier l'offre"
                                                >
                                                    <Edit size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOffer(offre._id, offre.titre)}
                                                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                                    aria-label="Supprimer l'offre"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-500">Vous n'avez pas encore créé d'offres.</p>
                            </div>
                        )}
                    </div>
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
                                            <div className="font-semibold text-green-800">{application.laureat?.name || 'Utilisateur'}</div>
                                            <div className="text-xs text-gray-500 mb-2">{application.laureat?.emailEdu}</div>
                                            <div className="flex gap-2 mb-1">
                                                {application.cv && (
                                                    <button
                                                        className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium"
                                                        onClick={(e) => { e.stopPropagation(); downloadFile(application.cv, 'CV.pdf'); }}
                                                    >
                                                        <Eye size={14} />
                                                        Voir le CV
                                                    </button>
                                                )}
                                                {application.lettreMotivation && (
                                                    <button
                                                        className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium"
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

            {/* Modale pour la modification d'une offre */}
            {isEditModalOpen && editingOffer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Modifier l'offre</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleEditOffer} className="space-y-4">
                            <div>
                                <label htmlFor="editTitre" className="block text-sm font-medium text-gray-700">Titre de l'offre</label>
                                <input
                                    id="editTitre"
                                    type="text"
                                    value={editingOffer.titre}
                                    onChange={(e) => setEditingOffer({ ...editingOffer, titre: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    id="editDescription"
                                    rows="4"
                                    value={editingOffer.description}
                                    onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                    required
                                ></textarea>
                            </div>
                            
                            <div>
                                <label htmlFor="editCompetences" className="block text-sm font-medium text-gray-700">Compétences (séparées par des virgules)</label>
                                <input
                                    id="editCompetences"
                                    type="text"
                                    value={Array.isArray(editingOffer.competencesRequises) ? editingOffer.competencesRequises.join(', ') : editingOffer.competencesRequises}
                                    onChange={(e) => setEditingOffer({ ...editingOffer, competencesRequises: e.target.value.split(',').map(s => s.trim()) })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateOfferMutation.isPending}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
                                >
                                    {updateOfferMutation.isPending ? "Sauvegarde..." : "Sauvegarder les modifications"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OffresPage; 
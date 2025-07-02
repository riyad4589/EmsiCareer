import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import { Edit, Trash2, Plus, Users, Calendar, MapPin, Eye, X, Building2, Clock, Heart, MessageCircle, FileText, User, Upload, Image as ImageIcon } from "lucide-react";
import { useState, useRef } from "react";

const OffersManagementPage = () => {
    const [editingOffer, setEditingOffer] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        titre: "",
        description: "",
        localisation: "",
        typeContrat: "CDI",
        competencesRequises: [],
        dateExpiration: "",
        medias: []
    });
    const [createForm, setCreateForm] = useState({
        titre: "",
        description: "",
        localisation: "",
        typeContrat: "CDI",
        competencesRequises: [],
        dateExpiration: "",
        medias: [],
        authorId: ""
    });
    const [expandedRow, setExpandedRow] = useState(null);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const fileInputRef = useRef(null);

    const queryClient = useQueryClient();

    const { data: authorsData } = useQuery({
        queryKey: ["authors"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/admin/users");
                return response.data.filter(user => 
                    user.role === "recruteur" || user.role === "admin"
                );
            } catch (error) {
                console.error("Erreur lors de la récupération des auteurs:", error);
                throw new Error(error.response?.data?.message || "Une erreur est survenue lors du chargement des auteurs");
            }
        }
    });

    const { data: offersData, isLoading, error } = useQuery({
        queryKey: ["offers"],
        queryFn: async () => {
            const response = await axiosInstance.get("/admin/offres");
            console.log('Réponse API /admin/offres:', response.data);
            return response.data.data || response.data.offers || response.data;
        },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
        retry: 3,
        refetchOnWindowFocus: true,
    });

    const { data: stats } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => {
            const response = await axiosInstance.get("/admin/stats");
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
        retry: 3,
        refetchOnWindowFocus: true,
    });

    const { mutate: updateOffer } = useMutation({
        mutationFn: (offerData) => {
            const { _id, ...updateData } = offerData;
            return axiosInstance.put(`/admin/posts/${_id}`, updateData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["offers"]);
            toast.success("Offre mise à jour avec succès");
            setEditingOffer(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
        },
    });

    const { mutate: deleteOffer } = useMutation({
        mutationFn: (postId) => axiosInstance.delete(`/admin/posts/${postId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(["offers"]);
            toast.success("Offre supprimée avec succès");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Erreur lors de la suppression");
        },
    });

    const { mutate: createOffer } = useMutation({
        mutationFn: (offerData) => axiosInstance.post("/admin/posts", offerData),
        onSuccess: () => {
            queryClient.invalidateQueries(["offers"]);
            toast.success("Offre créée avec succès");
            setIsCreateModalOpen(false);
            setCreateForm({
                titre: "",
                description: "",
                localisation: "",
                typeContrat: "CDI",
                competencesRequises: [],
                dateExpiration: "",
                medias: [],
                authorId: ""
            });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Erreur lors de la création");
        },
    });

    const handleEdit = (offer) => {
        setEditingOffer(offer._id);
        setEditForm({
            titre: offer.titre,
            description: offer.description,
            localisation: offer.localisation,
            typeContrat: offer.typeContrat,
            competencesRequises: offer.competencesRequises,
            dateExpiration: offer.dateExpiration,
            medias: offer.medias
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateOffer({ 
            _id: editingOffer, 
            ...editForm
        });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        if (!createForm.authorId) {
            toast.error("Veuillez sélectionner un auteur");
            return;
        }
        createOffer(createForm);
    };

    const getContractTypeColor = (type) => {
        switch(type) {
            case 'CDI': return 'bg-emerald-500';
            case 'CDD': return 'bg-blue-500';
            case 'Stage': return 'bg-orange-500';
            case 'Freelance': return 'bg-purple-500';
            case 'Alternance': return 'bg-indigo-500';
            default: return 'bg-gray-500';
        }
    };

    const handleFileUpload = async (file, formType = 'create') => {
        if (!file) return;
        
        const formData = new FormData();
        formData.append('media', file);
        
        setUploadingMedia(true);
        
        try {
            const response = await axiosInstance.post('/upload/media', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            const mediaUrl = response.data.url;
            
            if (formType === 'create') {
                setCreateForm(prev => ({
                    ...prev,
                    medias: [...prev.medias, mediaUrl]
                }));
            } else {
                setEditForm(prev => ({
                    ...prev,
                    medias: [...prev.medias, mediaUrl]
                }));
            }
            
            toast.success('Média uploadé avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
            toast.error('Erreur lors de l\'upload du média');
        } finally {
            setUploadingMedia(false);
        }
    };

    const removeMedia = (index, formType = 'create') => {
        if (formType === 'create') {
            setCreateForm(prev => ({
                ...prev,
                medias: prev.medias.filter((_, i) => i !== index)
            }));
        } else {
            setEditForm(prev => ({
                ...prev,
                medias: prev.medias.filter((_, i) => i !== index)
            }));
        }
        toast.success('Média supprimé');
    };

    const triggerFileUpload = (formType = 'create') => {
        fileInputRef.current.click();
        fileInputRef.current.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                handleFileUpload(file, formType);
            }
        };
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
                        <Building2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-600" />
                    </div>
                    <p className="mt-6 text-slate-600 font-medium">Chargement des offres...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="h-8 w-8 text-red-500" />
                    </div>
                    <p className="text-red-600 text-lg font-semibold">Une erreur est survenue</p>
                    <p className="text-slate-600 mt-2">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-600 rounded-xl">
                            <Building2 className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Gestion des Offres</h1>
                            <p className="text-slate-600 mt-1">Gérez et organisez vos offres d'emploi</p>
                        </div>
                        {offersData && (
                            <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
                                <span className="text-emerald-600 font-semibold text-sm">
                                    {offersData.length} Offre{offersData.length > 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transform hover:scale-105 transition-all duration-200 font-medium"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nouvelle offre
                    </button>
                </div>

                {/* Grille des offres */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offersData && offersData.length > 0 ? (
                        offersData.map((offre) => (
                            <div 
                                key={offre._id} 
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-slate-200 overflow-hidden group"
                                onClick={() => setSelectedOffer(offre)}
                            >
                                {/* Image de l'offre */}
                                <div className="relative h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 overflow-hidden">
                                    {offre.medias && offre.medias.length > 0 ? (
                                        <img 
                                            src={offre.medias[0]} 
                                            alt={offre.titre}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.querySelector('.fallback-content').style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className="fallback-content absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center" style={{ display: offre.medias && offre.medias.length > 0 ? 'none' : 'flex' }}>
                                        <Building2 className="h-16 w-16 text-white opacity-80" />
                                    </div>
                                    
                                    {/* Badge type de contrat */}
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getContractTypeColor(offre.typeContrat)} shadow-lg`}>
                                            {offre.typeContrat || 'Non spécifié'}
                                        </span>
                                    </div>
                                    
                                    {/* Overlay avec icône voir */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                        <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                </div>

                                {/* Contenu de la carte */}
                                <div className="p-6">
                                    {/* Titre */}
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-200">
                                        {offre.titre}
                                    </h3>
                                    
                                    {/* Auteur */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4 text-slate-600" />
                                        </div>
                                        <span className="text-slate-600 font-medium text-sm">
                                            {offre.author?.name || offre.author || 'Auteur non spécifié'}
                                        </span>
                                    </div>

                                    {/* Localisation */}
                                    {offre.localisation && (
                                        <div className="flex items-center gap-2 mb-3">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            <span className="text-slate-600 text-sm">{offre.localisation}</span>
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Heart className="h-3 w-3" />
                                                <span>{offre.likes?.length || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageCircle className="h-3 w-3" />
                                                <span>{offre.comments?.length || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                <span>{offre.candidatures?.length || 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <Clock className="h-3 w-3" />
                                            <span>{offre.createdAt ? new Date(offre.createdAt).toLocaleDateString('fr-FR') : '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-16">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Building2 className="h-12 w-12 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune offre trouvée</h3>
                            <p className="text-slate-600 text-center mb-6">Commencez par créer votre première offre d'emploi</p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transform hover:scale-105 transition-all duration-200 font-medium"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Créer une offre
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de création d'offre */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-900">Créer une nouvelle offre</h2>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Auteur
                                </label>
                                <select
                                    value={createForm.authorId}
                                    onChange={(e) => setCreateForm({ ...createForm, authorId: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
                                    required
                                >
                                    <option value="">Sélectionner un auteur</option>
                                    {authorsData?.map((author) => (
                                        <option key={author._id} value={author._id}>
                                            {author.name} ({author.role === "admin" ? "Administrateur" : "Recruteur"})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Titre de l'offre
                                </label>
                                <input
                                    type="text"
                                    value={createForm.titre}
                                    onChange={(e) => setCreateForm({ ...createForm, titre: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                    placeholder="Titre de l'offre d'emploi..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                                    rows="4"
                                    placeholder="Description détaillée de l'offre d'emploi..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Localisation
                                </label>
                                <input
                                    type="text"
                                    value={createForm.localisation}
                                    onChange={(e) => setCreateForm({ ...createForm, localisation: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                    placeholder="Ville, pays..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Type de contrat
                                </label>
                                <select
                                    value={createForm.typeContrat}
                                    onChange={(e) => setCreateForm({ ...createForm, typeContrat: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
                                    required
                                >
                                    <option value="CDI">CDI</option>
                                    <option value="CDD">CDD</option>
                                    <option value="Stage">Stage</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Alternance">Alternance</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Compétences requises (séparées par des virgules)
                                </label>
                                <input
                                    type="text"
                                    value={createForm.competencesRequises.join(', ')}
                                    onChange={(e) => setCreateForm({ 
                                        ...createForm, 
                                        competencesRequises: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill)
                                    })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                    placeholder="JavaScript, React, Node.js..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Date d'expiration
                                </label>
                                <input
                                    type="date"
                                    value={createForm.dateExpiration}
                                    onChange={(e) => setCreateForm({ ...createForm, dateExpiration: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Médias
                                </label>
                                <div className="space-y-4">
                                    {/* Zone d'upload */}
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => triggerFileUpload('create')}
                                            disabled={uploadingMedia}
                                            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                        >
                                            {uploadingMedia ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            ) : (
                                                <Upload className="h-4 w-4 mr-2" />
                                            )}
                                            {uploadingMedia ? 'Upload en cours...' : 'Ajouter une image'}
                                        </button>
                                        <p className="text-sm text-slate-500 mt-2">
                                            Glissez-déposez une image ou cliquez pour sélectionner
                                        </p>
                                    </div>

                                    {/* Prévisualisation des médias */}
                                    {createForm.medias.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-700 mb-3">Images uploadées :</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {createForm.medias.map((media, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={media}
                                                            alt={`media-${index}`}
                                                            className="w-full h-24 object-cover rounded-lg border border-slate-200"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                        <div className="hidden w-full h-24 bg-slate-100 rounded-lg border border-slate-200 items-center justify-center">
                                                            <ImageIcon className="h-8 w-8 text-slate-400" />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMedia(index, 'create')}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors duration-200 font-medium"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors duration-200 font-medium shadow-lg"
                                >
                                    Créer l'offre
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de modification d'offre */}
            {editingOffer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-900">Modifier l'offre</h2>
                            <button
                                onClick={() => setEditingOffer(null)}
                                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Titre de l'offre
                                </label>
                                <input
                                    type="text"
                                    value={editForm.titre}
                                    onChange={(e) => setEditForm({ ...editForm, titre: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                    placeholder="Titre de l'offre d'emploi..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                                    rows="4"
                                    placeholder="Description détaillée de l'offre d'emploi..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Localisation
                                </label>
                                <input
                                    type="text"
                                    value={editForm.localisation}
                                    onChange={(e) => setEditForm({ ...editForm, localisation: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                    placeholder="Ville, pays..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Type de contrat
                                </label>
                                <select
                                    value={editForm.typeContrat}
                                    onChange={(e) => setEditForm({ ...editForm, typeContrat: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
                                    required
                                >
                                    <option value="CDI">CDI</option>
                                    <option value="CDD">CDD</option>
                                    <option value="Stage">Stage</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Alternance">Alternance</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Compétences requises (séparées par des virgules)
                                </label>
                                <input
                                    type="text"
                                    value={editForm.competencesRequises.join(', ')}
                                    onChange={(e) => setEditForm({ 
                                        ...editForm, 
                                        competencesRequises: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill)
                                    })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                    placeholder="JavaScript, React, Node.js..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Date d'expiration
                                </label>
                                <input
                                    type="date"
                                    value={editForm.dateExpiration ? editForm.dateExpiration.split('T')[0] : ''}
                                    onChange={(e) => setEditForm({ ...editForm, dateExpiration: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Médias
                                </label>
                                <div className="space-y-4">
                                    {/* Zone d'upload */}
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => triggerFileUpload('edit')}
                                            disabled={uploadingMedia}
                                            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                        >
                                            {uploadingMedia ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            ) : (
                                                <Upload className="h-4 w-4 mr-2" />
                                            )}
                                            {uploadingMedia ? 'Upload en cours...' : 'Ajouter une image'}
                                        </button>
                                        <p className="text-sm text-slate-500 mt-2">
                                            Glissez-déposez une image ou cliquez pour sélectionner
                                        </p>
                                    </div>

                                    {/* Prévisualisation des médias */}
                                    {editForm.medias.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-700 mb-3">Images uploadées :</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {editForm.medias.map((media, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={media}
                                                            alt={`media-${index}`}
                                                            className="w-full h-24 object-cover rounded-lg border border-slate-200"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                        <div className="hidden w-full h-24 bg-slate-100 rounded-lg border border-slate-200 items-center justify-center">
                                                            <ImageIcon className="h-8 w-8 text-slate-400" />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMedia(index, 'edit')}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingOffer(null)}
                                    className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors duration-200 font-medium"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors duration-200 font-medium shadow-lg"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal détaillée de l'offre */}
            {selectedOffer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="relative">
                            {/* Header avec image */}
                            <div className="relative h-64 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-t-2xl overflow-hidden">
                                {selectedOffer.medias && selectedOffer.medias.length > 0 ? (
                                    <img 
                                        src={selectedOffer.medias[0]} 
                                        alt={selectedOffer.titre}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Building2 className="h-24 w-24 text-white opacity-80" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                                <button
                                    onClick={() => setSelectedOffer(null)}
                                    className="absolute top-6 right-6 bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-opacity-30 transition-all"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getContractTypeColor(selectedOffer.typeContrat)} shadow-lg`}>
                                            {selectedOffer.typeContrat || 'Non spécifié'}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-2">{selectedOffer.titre}</h2>
                                    <div className="flex items-center gap-2 text-white text-opacity-90">
                                        <User className="h-4 w-4" />
                                        <span>{selectedOffer.author?.name || selectedOffer.author || 'Auteur non spécifié'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Informations principales */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Informations générales</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium text-slate-700">Description</p>
                                                        <p className="text-slate-600 text-sm">{selectedOffer.description || 'Aucune description'}</p>
                                                    </div>
                                                </div>
                                                {selectedOffer.localisation && (
                                                    <div className="flex items-center gap-3">
                                                        <MapPin className="h-5 w-5 text-slate-400" />
                                                        <div>
                                                            <p className="font-medium text-slate-700">Localisation</p>
                                                            <p className="text-slate-600 text-sm">{selectedOffer.localisation}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedOffer.dateExpiration && (
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="h-5 w-5 text-slate-400" />
                                                        <div>
                                                            <p className="font-medium text-slate-700">Date d'expiration</p>
                                                            <p className="text-slate-600 text-sm">{new Date(selectedOffer.dateExpiration).toLocaleDateString('fr-FR')}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedOffer.competencesRequises && selectedOffer.competencesRequises.length > 0 && (
                                                    <div className="flex items-start gap-3">
                                                        <Users className="h-5 w-5 text-slate-400 mt-0.5" />
                                                        <div>
                                                            <p className="font-medium text-slate-700 mb-2">Compétences requises</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {selectedOffer.competencesRequises.map((competence, idx) => (
                                                                    <span key={idx} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                                                        {competence}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Statistiques */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Statistiques</h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="bg-red-50 p-4 rounded-xl text-center">
                                                    <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
                                                    <p className="text-2xl font-bold text-red-600">{selectedOffer.likes?.length || 0}</p>
                                                    <p className="text-xs text-red-600">Likes</p>
                                                </div>
                                                <div className="bg-blue-50 p-4 rounded-xl text-center">
                                                    <MessageCircle className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                                                    <p className="text-2xl font-bold text-blue-600">{selectedOffer.comments?.length || 0}</p>
                                                    <p className="text-xs text-blue-600">Commentaires</p>
                                                </div>
                                                <div className="bg-emerald-50 p-4 rounded-xl text-center">
                                                    <Users className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                                                    <p className="text-2xl font-bold text-emerald-600">{selectedOffer.candidatures?.length || 0}</p>
                                                    <p className="text-xs text-emerald-600">Candidatures</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dates */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Historique</h3>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                                    <span className="text-sm text-slate-600">Créée le</span>
                                                    <span className="text-sm font-medium text-slate-900">
                                                        {selectedOffer.createdAt ? new Date(selectedOffer.createdAt).toLocaleString('fr-FR') : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center py-2">
                                                    <span className="text-sm text-slate-600">Modifiée le</span>
                                                    <span className="text-sm font-medium text-slate-900">
                                                        {selectedOffer.updatedAt ? new Date(selectedOffer.updatedAt).toLocaleString('fr-FR') : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Détails secondaires */}
                                    <div className="space-y-6">
                                        {/* Médias */}
                                        {selectedOffer.medias && selectedOffer.medias.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900 mb-3">Médias</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {selectedOffer.medias.map((media, idx) => (
                                                        <a 
                                                            key={idx} 
                                                            href={media} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="block group"
                                                        >
                                                            <img 
                                                                src={media} 
                                                                alt={`media-${idx}`} 
                                                                className="w-full h-24 object-cover rounded-lg border border-slate-200 group-hover:border-emerald-300 transition-colors" 
                                                                onError={(e) => {e.target.style.display='none'}} 
                                                            />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Commentaires */}
                                        {selectedOffer.comments && selectedOffer.comments.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900 mb-3">Commentaires récents</h3>
                                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                                    {selectedOffer.comments.slice(0, 5).map((comment, idx) => (
                                                        <div key={idx} className="bg-slate-50 p-4 rounded-lg">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                                                                    <User className="h-3 w-3 text-emerald-600" />
                                                                </div>
                                                                <span className="font-medium text-slate-900 text-sm">
                                                                    {comment.user?.name || comment.user || 'Utilisateur'}
                                                                </span>
                                                                <span className="text-xs text-slate-500">
                                                                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('fr-FR') : ''}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-700 text-sm">{comment.content}</p>
                                                        </div>
                                                    ))}
                                                    {selectedOffer.comments.length > 5 && (
                                                        <p className="text-center text-slate-500 text-sm">
                                                            Et {selectedOffer.comments.length - 5} commentaire(s) de plus...
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Candidatures */}
                                        {selectedOffer.candidatures && selectedOffer.candidatures.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900 mb-3">Candidatures</h3>
                                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                                    {selectedOffer.candidatures.slice(0, 5).map((candidature, idx) => (
                                                        <div key={idx} className="bg-slate-50 p-4 rounded-lg">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                                        <User className="h-3 w-3 text-blue-600" />
                                                                    </div>
                                                                    <span className="font-medium text-slate-900 text-sm">
                                                                        {candidature.laureat?.name || candidature.laureat || 'Candidat'}
                                                                    </span>
                                                                </div>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                    candidature.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                                    candidature.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                    {candidature.status === 'accepted' ? 'Accepté' :
                                                                     candidature.status === 'rejected' ? 'Rejeté' : 'En attente'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-xs text-slate-600">
                                                                <span>
                                                                    {candidature.datePostulation ? new Date(candidature.datePostulation).toLocaleDateString('fr-FR') : ''}
                                                                </span>
                                                                {candidature.cv && (
                                                                    <a href={candidature.cv} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 underline">
                                                                        CV
                                                                    </a>
                                                                )}
                                                                {candidature.lettreMotivation && (
                                                                    <a href={candidature.lettreMotivation} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 underline">
                                                                        Lettre
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {selectedOffer.candidatures.length > 5 && (
                                                        <p className="text-center text-slate-500 text-sm">
                                                            Et {selectedOffer.candidatures.length - 5} candidature(s) de plus...
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
                                    <button
                                        onClick={() => {
                                            setSelectedOffer(null);
                                            handleEdit(selectedOffer);
                                        }}
                                        className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
                                                deleteOffer(selectedOffer._id);
                                                setSelectedOffer(null);
                                            }
                                        }}
                                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OffersManagementPage;
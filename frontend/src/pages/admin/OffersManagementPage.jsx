import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import { Edit, Trash2, Plus } from "lucide-react";
import { useState } from "react";

const OffersManagementPage = () => {
    const [editingOffer, setEditingOffer] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        content: "",
        visibility: "public"
    });
    const [createForm, setCreateForm] = useState({
        content: "",
        visibility: "public",
        authorId: ""
    });
    const [expandedRow, setExpandedRow] = useState(null);
    const [selectedOffer, setSelectedOffer] = useState(null);

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
                content: "",
                visibility: "public",
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
            content: offer.content,
            visibility: offer.visibility
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des offres...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-500 text-lg">Une erreur est survenue lors du chargement des offres</p>
                    <p className="text-gray-600 mt-2">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
                        Gestion des Offres
                        
                        {offersData && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-base font-semibold align-middle">
                                {offersData.length} Offre{offersData.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </h1>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Ajouter une offre
                    </button>
                </div>

                <div className="bg-white shadow rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auteur</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {offersData && offersData.length > 0 ? (
                                offersData.map((offre, idx) => (
                                    <tr key={offre._id} className={idx % 2 === 0 ? "bg-white cursor-pointer" : "bg-gray-50 hover:bg-green-50 cursor-pointer"} onClick={() => setSelectedOffer(offre)}>
                                        <td className="px-4 py-3 whitespace-nowrap">{offre.author?.name || offre.author || '-'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap font-semibold">{offre.titre}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                                        Aucune offre trouvée
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de création d'offre */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Créer une nouvelle offre</h2>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Auteur
                                </label>
                                <select
                                    value={createForm.authorId}
                                    onChange={(e) => setCreateForm({ ...createForm, authorId: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contenu de l'offre
                                </label>
                                <textarea
                                    value={createForm.content}
                                    onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                                    rows="4"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Visibilité
                                </label>
                                <select
                                    value={createForm.visibility}
                                    onChange={(e) => setCreateForm({ ...createForm, visibility: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Privé</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                                >
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de modification d'offre */}
            {editingOffer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Modifier l'offre</h2>
                            <button
                                onClick={() => setEditingOffer(null)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contenu de l'offre
                                </label>
                                <textarea
                                    value={editForm.content}
                                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                                    rows="4"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Visibilité
                                </label>
                                <select
                                    value={editForm.visibility}
                                    onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Privé</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingOffer(null)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODALE DÉTAILLÉE DE L'OFFRE */}
            {selectedOffer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={() => setSelectedOffer(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            aria-label="Fermer"
                        >
                            ×
                        </button>
                        <h2 className="text-2xl font-bold mb-4 text-green-700 flex items-center gap-2">
                            {selectedOffer.titre}
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold text-white ml-2 ${selectedOffer.typeContrat === 'CDI' ? 'bg-green-600' : selectedOffer.typeContrat === 'CDD' ? 'bg-blue-500' : selectedOffer.typeContrat === 'Stage' ? 'bg-yellow-500' : selectedOffer.typeContrat === 'Freelance' ? 'bg-purple-500' : 'bg-gray-400'}`}>{selectedOffer.typeContrat}</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                                <div className="mb-2"><b>Auteur :</b> {selectedOffer.author?.name || selectedOffer.author || '-'}</div>
                                <div className="mb-2"><b>Description :</b> {selectedOffer.description}</div>
                                <div className="mb-2"><b>Localisation :</b> {selectedOffer.localisation}</div>
                                <div className="mb-2"><b>Date d'expiration :</b> {selectedOffer.dateExpiration ? new Date(selectedOffer.dateExpiration).toLocaleDateString('fr-FR') : '-'}</div>
                                <div className="mb-2"><b>Compétences requises :</b> {selectedOffer.competencesRequises?.length > 0 ? selectedOffer.competencesRequises.join(', ') : '-'}</div>
                            </div>
                            <div>
                                <div className="mb-2"><b>Médias :</b> {selectedOffer.medias?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {selectedOffer.medias.map((media, idx) => (
                                            <a key={idx} href={media} target="_blank" rel="noopener noreferrer">
                                                <img src={media} alt={`media-${idx}`} className="w-20 h-20 object-cover rounded border" onError={e => {e.target.style.display='none'}} />
                                            </a>
                                        ))}
                                    </div>
                                ) : '-'}</div>
                                <div className="mb-2"><b>Likes :</b> {selectedOffer.likes?.length || 0}</div>
                                <div className="mb-2"><b>Créée le :</b> {selectedOffer.createdAt ? new Date(selectedOffer.createdAt).toLocaleString('fr-FR') : '-'}</div>
                                <div className="mb-2"><b>Modifiée le :</b> {selectedOffer.updatedAt ? new Date(selectedOffer.updatedAt).toLocaleString('fr-FR') : '-'}</div>
                            </div>
                        </div>
                        {/* Commentaires */}
                        {selectedOffer.comments?.length > 0 && (
                            <div className="mb-4">
                                <b>Commentaires :</b>
                                <ul className="list-disc ml-6 max-h-32 overflow-y-auto text-xs mt-1">
                                    {selectedOffer.comments.map((comment, idx) => (
                                        <li key={idx} className="mb-1">
                                            <b>{comment.user?.name || comment.user || '-'}</b> : {comment.content}
                                            <span className="text-[10px] text-gray-400 ml-2">{comment.createdAt ? new Date(comment.createdAt).toLocaleString('fr-FR') : '-'}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {/* Candidatures */}
                        {selectedOffer.candidatures?.length > 0 && (
                            <div className="mb-4">
                                <b>Candidatures :</b>
                                <ul className="list-disc ml-6 max-h-32 overflow-y-auto text-xs mt-1">
                                    {selectedOffer.candidatures.map((candid, idx) => (
                                        <li key={idx} className="mb-1">
                                            <b>{candid.laureat?.name || candid.laureat || '-'}</b> - <span className={`ml-2 px-2 py-0.5 rounded text-white text-[10px] ${candid.status === 'accepted' ? 'bg-green-600' : candid.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}>{candid.status}</span>
                                            <span className="text-[10px] text-gray-400 ml-2">{candid.datePostulation ? new Date(candid.datePostulation).toLocaleString('fr-FR') : '-'}</span>
                                            <br/>CV : {candid.cv ? <a href={candid.cv} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">CV</a> : '-'}
                                            <br/>Lettre de motivation : {candid.lettreMotivation ? <a href={candid.lettreMotivation} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Lettre de motivation</a> : '-'}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OffersManagementPage; 
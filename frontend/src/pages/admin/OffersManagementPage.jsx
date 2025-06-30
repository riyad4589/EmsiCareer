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
            try {
                const response = await axiosInstance.get("/admin/posts");
                return response.data.filter(post => 
                    post.author.role === "recruteur" || post.author.role === "admin"
                );
            } catch (error) {
                console.error("Erreur lors de la récupération des offres:", error);
                throw new Error(error.response?.data?.message || "Une erreur est survenue lors du chargement des offres");
            }
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
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Offres</h1>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Ajouter une offre
                    </button>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Auteur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contenu
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Visibilité
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {offersData && offersData.length > 0 ? (
                                offersData.map((offer) => (
                                    <tr key={offer._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img
                                                        className="h-10 w-10 rounded-full"
                                                        src={offer.author.profilePicture || "/avatar.png"}
                                                        alt={offer.author.name}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{offer.author.name}</div>
                                                    <div className="text-sm text-gray-500">@{offer.author.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 line-clamp-2">{offer.content}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                offer.visibility === "public"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-green-100 text-green-800"
                                            }`}>
                                                {offer.visibility === "public" ? "Public" : "Privé"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(offer.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-4">
                                                <button
                                                    onClick={() => handleEdit(offer)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
                                                            deleteOffer(offer._id);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
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
        </div>
    );
};

export default OffersManagementPage; 
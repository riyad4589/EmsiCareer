import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import { Check, X, Users, FileText, Briefcase } from "lucide-react";

const AdminDashboard = () => {
    const queryClient = useQueryClient();

    const { data: pendingUsers, isLoading: isLoadingPendingUsers } = useQuery({
        queryKey: ["pendingUsers"],
        queryFn: async () => {
            const response = await axiosInstance.get("/admin/pending-users");
            console.log("Pending Users:", response.data);
            return response.data;
        },
    });

    const { data: users, isLoading: isLoadingUsers } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await axiosInstance.get("/admin/users");
            console.log("All Users:", response.data);
            return response.data;
        },
    });

    const { data: posts, isLoading: isLoadingPosts } = useQuery({
        queryKey: ["posts"],
        queryFn: async () => {
            const response = await axiosInstance.get("/admin/posts");
            console.log("All Posts:", response.data);
            return response.data;
        },
    });

    const { mutate: validateUser } = useMutation({
        mutationFn: (userId) => axiosInstance.put(`/admin/validate/${userId}`),
        onSuccess: () => {
            toast.success("Compte validé avec succès");
            queryClient.invalidateQueries(["pendingUsers"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Une erreur est survenue");
        },
    });

    const { mutate: rejectUser } = useMutation({
        mutationFn: (userId) => axiosInstance.put(`/admin/reject/${userId}`),
        onSuccess: () => {
            toast.success("Compte rejeté");
            queryClient.invalidateQueries(["pendingUsers"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Une erreur est survenue");
        },
    });

    if (isLoadingUsers || isLoadingPosts || isLoadingPendingUsers) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des données...</p>
                </div>
            </div>
        );
    }

    // Calculer les statistiques
    const totalUsers = users?.filter(user => user.role === "user").length || 0;
    const totalRecruteurs = users?.filter(user => user.role === "recruteur").length || 0;
    const totalPosts = posts?.length || 0;
    const totalOffers = posts?.filter(post => post.author?.role === "recruteur" || post.author?.role === "admin").length || 0;

    console.log("Statistiques calculées:", {
        totalUsers,
        totalRecruteurs,
        totalPosts,
        totalOffers,
        usersCount: users?.length,
        postsCount: posts?.length
    });

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Tableau de bord</h1>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Carte des utilisateurs */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                <Users className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-sm font-medium text-gray-600">Utilisateurs</h2>
                                <p className="text-2xl font-semibold text-gray-900">{totalUsers}</p>
                            </div>
                        </div>
                    </div>
                    {/* Carte des recruteurs */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                <Users className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-sm font-medium text-gray-600">Recruteurs</h2>
                                <p className="text-2xl font-semibold text-gray-900">{totalRecruteurs}</p>
                            </div>
                        </div>
                    </div>

                    {/* Carte des posts */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-sm font-medium text-gray-600">Posts</h2>
                                <p className="text-2xl font-semibold text-gray-900">{totalPosts}</p>
                            </div>
                        </div>
                    </div>

                    {/* Carte des offres */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                                <Briefcase className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-sm font-medium text-gray-600">Offres</h2>
                                <p className="text-2xl font-semibold text-gray-900">{totalOffers}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liste des comptes en attente */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Comptes en attente de validation</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {pendingUsers?.length > 0 ? (
                            pendingUsers.map((user) => (
                                <div key={user._id} className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <img
                                                className="h-10 w-10 rounded-full"
                                                src={user.profilePicture || "/default-avatar.png"}
                                                alt={user.name}
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                                            <p className="text-sm text-gray-500">{user.emailEdu}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => validateUser(user._id)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            <Check className="h-4 w-4 mr-1" />
                                            Valider
                                        </button>
                                        <button
                                            onClick={() => rejectUser(user._id)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Rejeter
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-4 text-center text-gray-500">
                                Aucun compte en attente de validation
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 
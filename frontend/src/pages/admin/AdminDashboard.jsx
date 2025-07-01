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
            return response.data;
        },
    });

    const { data: users, isLoading: isLoadingUsers } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await axiosInstance.get("/admin/users");
            return response.data;
        },
    });

    const { data: posts, isLoading: isLoadingPosts } = useQuery({
        queryKey: ["posts"],
        queryFn: async () => {
            const response = await axiosInstance.get("/admin/posts");
            return response.data;
        },
    });

    const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
        const response = await axiosInstance.get("/admin/stats");
        return response.data;
    },
    staleTime: 1000 * 30, // considère les données fraîches pendant 30s
    cacheTime: 1000 * 60, // données gardées 1 min après démontage
    retry: 2,
    refetchOnWindowFocus: false, // moins de refetch inutiles
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

    if (isLoadingUsers || isLoadingPosts || isLoadingPendingUsers || isLoadingStats) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto"></div>
                    <p className="text-gray-500 text-sm">Chargement des données...</p>
                </div>
            </div>
        );
    }

    const totalUsers = users?.filter(u => u.role === "user").length || 0;
    const totalRecruteurs = users?.filter(u => u.role === "recruteur").length || 0;
    const totalPosts = posts?.length || 0;
    const totalOffers = typeof stats?.totalOffers === "number" ? stats.totalOffers : 0;

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <h1 className="text-2xl font-bold text-gray-800">Tableau de bord administrateur</h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Statistiques */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard icon={<Users className="w-6 h-6" />} label="Utilisateurs" value={totalUsers} color="green" />
                    <StatCard icon={<Users className="w-6 h-6" />} label="Recruteurs" value={totalRecruteurs} color="blue" />
                    <StatCard icon={<FileText className="w-6 h-6" />} label="Posts" value={totalPosts} color="purple" />
                    <StatCard
                        icon={<Briefcase className="w-6 h-6" />}
                        label="Offres"
                        value={totalOffers}
                        color="orange"
                        subtext={`Dont ${stats?.totalOffersByRecruiters ?? 0} par des recruteurs`}
                    />
                </section>

                {/* Comptes à valider */}
                <section className="bg-white shadow rounded-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Comptes en attente de validation</h2>
                    </div>

                    {pendingUsers?.length > 0 ? (
                        <ul className="divide-y divide-gray-100">
                            {pendingUsers.map(user => (
                                <li key={user._id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={user.profilePicture || "/default-avatar.png"}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-800">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.emailEdu}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => validateUser(user._id)}
                                            className="flex items-center gap-1 px-4 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition"
                                        >
                                            <Check className="w-4 h-4" />
                                            Valider
                                        </button>
                                        <button
                                            onClick={() => rejectUser(user._id)}
                                            className="flex items-center gap-1 px-4 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition"
                                        >
                                            <X className="w-4 h-4" />
                                            Rejeter
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-6 py-10 text-center text-gray-500 text-sm">
                            Aucun compte en attente de validation
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

// 🔸 Composant Statistique Card
const StatCard = ({ icon, label, value, color, subtext }) => {
    const colorMap = {
        green: "bg-green-100 text-green-600",
        blue: "bg-blue-100 text-blue-600",
        purple: "bg-purple-100 text-purple-600",
        orange: "bg-orange-100 text-orange-600",
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${colorMap[color]}`}>{icon}</div>
                <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                    {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
                </div>
            </div>
        </div>
    );
};


export default AdminDashboard;

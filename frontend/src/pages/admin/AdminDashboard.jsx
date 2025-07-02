import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import { Check, X, Users, FileText, Briefcase, Shield, Activity, TrendingUp } from "lucide-react";

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
        staleTime: 1000 * 30,
        cacheTime: 1000 * 60,
        retry: 2,
        refetchOnWindowFocus: false,
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
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
                <div className="text-center space-y-6">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-400/20 to-emerald-400/20 animate-pulse"></div>
                    </div>
                    <div>
                        <p className="text-gray-700 text-lg font-semibold">Chargement des données...</p>
                        <p className="text-gray-500 text-sm mt-1">Veuillez patienter un instant</p>
                    </div>
                </div>
            </div>
        );
    }

    const totalUsers = users?.filter(u => u.role === "user").length || 0;
    const totalRecruteurs = users?.filter(u => u.role === "recruteur").length || 0;
    const totalPosts = posts?.length || 0;
    const totalOffers = typeof stats?.totalOffers === "number" ? stats.totalOffers : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            {/* Header avec effet glassmorphism */}
            <header className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-green-100/50 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-700">
                                Dashboard Administrateur
                            </h1>
                            <p className="text-gray-600 font-medium">Gestion et supervision de la plateforme</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Section titre avec indicateur */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Activity className="w-6 h-6 text-green-600" />
                        <h2 className="text-2xl font-bold text-gray-800">Statistiques générales</h2>
                    </div>
                    <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                </div>

                {/* Statistiques avec design amélioré */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    <StatCard 
                        icon={<Users className="w-7 h-7" />} 
                        label="Utilisateurs" 
                        value={totalUsers} 
                        gradient="from-green-500 to-emerald-500"
                        bgGradient="from-green-50 to-emerald-50"
                    />
                    <StatCard 
                        icon={<Users className="w-7 h-7" />} 
                        label="Recruteurs" 
                        value={totalRecruteurs} 
                        gradient="from-emerald-500 to-teal-500"
                        bgGradient="from-emerald-50 to-teal-50"
                    />
                    <StatCard 
                        icon={<FileText className="w-7 h-7" />} 
                        label="Posts" 
                        value={totalPosts} 
                        gradient="from-teal-500 to-cyan-500"
                        bgGradient="from-teal-50 to-cyan-50"
                    />
                    <StatCard
                        icon={<Briefcase className="w-7 h-7" />}
                        label="Offres d'emploi"
                        value={totalOffers}
                        gradient="from-lime-500 to-green-500"
                        bgGradient="from-lime-50 to-green-50"
                        subtext={`Dont ${stats?.totalOffersByRecruiters ?? 0} par des recruteurs`}
                    />
                </section>

                {/* Section validation avec design amélioré */}
                <section className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border border-green-100/50 overflow-hidden hover:shadow-3xl transition-all duration-300">
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-8 py-6 border-b border-green-100/50">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                                <Check className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Comptes en attente de validation</h2>
                                <p className="text-gray-600 text-sm mt-1">
                                    {pendingUsers?.length || 0} compte{(pendingUsers?.length || 0) !== 1 ? 's' : ''} à traiter
                                </p>
                            </div>
                        </div>
                    </div>

                    {pendingUsers?.length > 0 ? (
                        <div className="divide-y divide-green-100/50">
                            {pendingUsers.map((user, index) => (
                                <div 
                                    key={user._id} 
                                    className="px-8 py-6 hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-all duration-300 group"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-6">
                                            <div className="relative">
                                                <img
                                                    src={user.profilePicture || "/default-avatar.png"}
                                                    alt={user.name}
                                                    className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-green-100 group-hover:border-green-200 transition-colors"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full border-2 border-white shadow-sm"></div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-gray-800 text-lg">{user.name}</p>
                                                <p className="text-gray-600 font-medium">{user.emailEdu}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                    <span>En attente de validation</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => validateUser(user._id)}
                                                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                            >
                                                <Check className="w-4 h-4" />
                                                Valider
                                            </button>
                                            <button
                                                onClick={() => rejectUser(user._id)}
                                                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                            >
                                                <X className="w-4 h-4" />
                                                Rejeter
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-8 py-16 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tout est à jour !</h3>
                            <p className="text-gray-500">Aucun compte en attente de validation</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

// Composant StatCard amélioré avec thème vert
const StatCard = ({ icon, label, value, gradient, bgGradient, subtext, trend }) => {
    return (
        <div className={`group bg-gradient-to-br ${bgGradient} backdrop-blur-sm rounded-2xl shadow-lg border border-green-100/50 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden`}>
            {/* Effet de brillance au hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                        {icon}
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                            <TrendingUp className="w-3 h-3" />
                            {trend}
                        </div>
                    )}
                </div>
                
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</p>
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                    {subtext && (
                        <p className="text-xs text-gray-500 font-medium bg-white/60 rounded-lg px-2 py-1 inline-block">
                            {subtext}
                        </p>
                    )}
                </div>

                {/* Barre de progression décorative */}
                <div className="mt-4 h-1 bg-white/40 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${gradient} rounded-full w-3/4 animate-pulse`}></div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
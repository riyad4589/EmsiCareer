import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Users, UserPlus, FileText, Briefcase } from "lucide-react";

const DashboardPage = () => {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/admin/stats");
                return response.data;
            } catch (error) {
                console.error("Erreur lors de la récupération des statistiques:", error);
                throw new Error(error.response?.data?.message || "Une erreur est survenue lors du chargement des statistiques");
            }
        },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
        retry: 3,
        refetchOnWindowFocus: true,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-500 text-lg">Une erreur est survenue lors du chargement des statistiques</p>
                    <p className="text-gray-600 mt-2">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Tableau de bord</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Carte des utilisateurs */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600">
                                <Users className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-sm font-medium text-gray-600">Utilisateurs</h2>
                                <p className="text-2xl font-semibold text-gray-900">{stats?.totalUsers || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Carte des recruteurs */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600">
                                <UserPlus className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-sm font-medium text-gray-600">Recruteurs</h2>
                                <p className="text-2xl font-semibold text-gray-900">{stats?.totalRecruiters || 0}</p>
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
                                <p className="text-2xl font-semibold text-gray-900">{stats?.totalPosts || 0}</p>
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
                                <p className="text-2xl font-semibold text-gray-900">{stats?.totalOffers ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage; 
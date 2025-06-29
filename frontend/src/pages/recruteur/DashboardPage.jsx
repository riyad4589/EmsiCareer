import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Building2, Users, FileText, Briefcase } from "lucide-react";

const DashboardPage = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["recruiterStats"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/recruiter/stats");
                return response.data;
            } catch (error) {
                console.error("Erreur lors de la récupération des statistiques:", error);
                return {
                    totalOffers: 0,
                    totalApplications: 0,
                    activeOffers: 0,
                    pendingApplications: 0
                };
            }
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Tableau de bord recruteur</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Carte des offres d'emploi */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h2 className="text-sm font-medium text-gray-600">Offres d'emploi</h2>
                            <p className="text-2xl font-semibold text-gray-900">{stats?.totalOffers || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Carte des candidatures */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <Users className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h2 className="text-sm font-medium text-gray-600">Candidatures</h2>
                            <p className="text-2xl font-semibold text-gray-900">{stats?.totalApplications || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Carte des offres actives */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h2 className="text-sm font-medium text-gray-600">Offres actives</h2>
                            <p className="text-2xl font-semibold text-gray-900">{stats?.activeOffers || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Carte des candidatures en attente */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h2 className="text-sm font-medium text-gray-600">Candidatures en attente</h2>
                            <p className="text-2xl font-semibold text-gray-900">{stats?.pendingApplications || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage; 
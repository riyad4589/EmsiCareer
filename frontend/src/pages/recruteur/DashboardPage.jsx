import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Building2, Users, FileText, Briefcase, MessageCircle, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardPage = () => {
    const navigate = useNavigate();
    const { data: stats, isLoading } = useQuery({
    queryKey: ["recruiterStats"],
    queryFn: async () => {
        try {
        const response = await axiosInstance.get("/recruteur/stats");
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


    // Récupérer le profil du recruteur
    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ["recruteurProfile"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/users/profile");
                return response.data;
            } catch (error) {
                return null;
            }
        }
    });

    if (isLoading || isProfileLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Message de bienvenue et infos entreprise */}
            {profile && (
                <div className="flex items-center gap-6 mb-8 bg-white rounded-lg shadow p-6">
                    <img
                        src={profile.companyLogo || "/logo.png"}
                        alt={profile.companyName}
                        className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                    />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Bienvenue, <span className="text-primary">{profile.name}</span> !</h2>
                        <p className="text-gray-700 font-medium">{profile.companyName} <span className="text-gray-400">|</span> {profile.industry}</p>
                        <div className="flex items-center gap-2 mt-1 text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{profile.location}</span>
                        </div>
                    </div>
                </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Tableau de bord recruteur</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Carte des offres d'emploi */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-primary text-primary">
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
                        <div className="p-3 rounded-full bg-primary text-primary">
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
                        <div className="p-3 rounded-full bg-primary text-primary">
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
                        <div className="p-3 rounded-full bg-primary text-primary">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h2 className="text-sm font-medium text-gray-600">Candidatures en attente</h2>
                            <p className="text-2xl font-semibold text-gray-900">{stats?.pendingApplications || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

           {/* Graphique de répartition des candidatures */}
<div className="bg-gradient-to-r from-white via-gray-50 to-white rounded-lg shadow-lg p-8 mb-8 border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800 mb-6">Répartition des candidatures</h2>
    <Bar
        data={{
            labels: ["Total", "Actives", "En attente"],
            datasets: [
                {
                    label: "Candidatures",
                    data: [
                        stats?.totalApplications || 0,
                        stats?.activeOffers || 0,
                        stats?.pendingApplications || 0
                    ],
                    backgroundColor: [
                        "rgba(59, 130, 246, 0.8)",   // bleu
                        "rgba(16, 185, 129, 0.8)",   // vert
                        "rgba(167, 139, 250, 0.8)"   // violet
                    ],
                    borderColor: [
                        "rgba(59, 130, 246, 1)",
                        "rgba(16, 185, 129, 1)",
                        "rgba(167, 139, 250, 1)"
                    ],
                    borderWidth: 1,
                    borderRadius: 8,
                    hoverBackgroundColor: [
                        "rgba(59, 130, 246, 1)",
                        "rgba(16, 185, 129, 1)",
                        "rgba(167, 139, 250, 1)"
                    ]
                }
            ]
        }}
        options={{
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                    labels: {
                        color: "#4B5563",
                        font: {
                            size: 14,
                            weight: "bold"
                        }
                    }
                },
                tooltip: {
                    backgroundColor: "#111827",
                    titleColor: "#fff",
                    bodyColor: "#e5e7eb",
                    borderWidth: 1,
                    borderColor: "#374151"
                }
            },
            animation: {
                duration: 800,
                easing: "easeOutQuart"
            },
            scales: {
                x: {
                    ticks: {
                        color: "#6B7280",
                        font: { size: 14 }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#6B7280",
                        font: { size: 14 },
                        stepSize: 1
                    },
                    grid: {
                        color: "#E5E7EB"
                    }
                }
            }
        }}
        height={100}
    />
</div>

        </div>
    );
};

export default DashboardPage; 
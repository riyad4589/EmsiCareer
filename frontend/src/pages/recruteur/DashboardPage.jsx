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
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Message de bienvenue et infos entreprise */}
                {profile && (
                    <div className="flex items-center gap-6 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 p-8 hover:shadow-2xl transition-all duration-300">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200 flex items-center justify-center overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
                            <img
                                src={profile.companyLogo || "/default-logo.png"}
                                alt={profile.companyName}
                                className="w-full h-full object-contain p-3"
                            />
                        </div>

                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Bienvenue, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">{profile.name}</span> !
                            </h2>
                            <p className="text-gray-700 font-semibold text-lg mb-2">
                                {profile.companyName} <span className="text-green-400 mx-2">•</span> 
                                <span className="text-green-600">{profile.industry}</span>
                            </p>
                            <div className="flex items-center gap-2 text-gray-600">
                                <div className="p-1 rounded-full bg-green-100">
                                    <MapPin className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="font-medium">{profile.location}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-700 mb-2">
                        Tableau de bord recruteur
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    {/* Carte des offres d'emploi */}
                    <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-center">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                <Briefcase className="h-7 w-7" />
                            </div>
                            <div className="ml-6">
                                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Offres d'emploi</h2>
                                <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.totalOffers || 0}</p>
                            </div>
                        </div>
                        <div className="mt-4 h-1 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-3/4 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Carte des candidatures */}
                    <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-center">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                <Users className="h-7 w-7" />
                            </div>
                            <div className="ml-6">
                                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Candidatures</h2>
                                <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.totalApplications || 0}</p>
                            </div>
                        </div>
                        <div className="mt-4 h-1 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-4/5 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Carte des offres actives */}
                    <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-center">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                <FileText className="h-7 w-7" />
                            </div>
                            <div className="ml-6">
                                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Offres actives</h2>
                                <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.activeOffers || 0}</p>
                            </div>
                        </div>
                        <div className="mt-4 h-1 bg-gradient-to-r from-teal-200 to-cyan-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full w-2/3 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Carte des candidatures en attente */}
                    <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-center">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-lime-500 to-green-500 text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                <Building2 className="h-7 w-7" />
                            </div>
                            <div className="ml-6">
                                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">En attente</h2>
                                <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.pendingApplications || 0}</p>
                            </div>
                        </div>
                        <div className="mt-4 h-1 bg-gradient-to-r from-lime-200 to-green-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-lime-500 to-green-500 rounded-full w-1/2 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Graphique de répartition des candidatures */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Répartition des candidatures</h2>
                            <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                                <span className="text-sm font-medium text-gray-600">Total</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                                <span className="text-sm font-medium text-gray-600">Actives</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"></div>
                                <span className="text-sm font-medium text-gray-600">En attente</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-6 border border-green-100/50">
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
                                            "rgba(34, 197, 94, 0.8)",    // green-500
                                            "rgba(16, 185, 129, 0.8)",   // emerald-500
                                            "rgba(20, 184, 166, 0.8)"    // teal-500
                                        ],
                                        borderColor: [
                                            "rgba(34, 197, 94, 1)",
                                            "rgba(16, 185, 129, 1)",
                                            "rgba(20, 184, 166, 1)"
                                        ],
                                        borderWidth: 2,
                                        borderRadius: 12,
                                        borderSkipped: false,
                                        hoverBackgroundColor: [
                                            "rgba(34, 197, 94, 0.9)",
                                            "rgba(16, 185, 129, 0.9)",
                                            "rgba(20, 184, 166, 0.9)"
                                        ],
                                        hoverBorderColor: [
                                            "rgba(34, 197, 94, 1)",
                                            "rgba(16, 185, 129, 1)",
                                            "rgba(20, 184, 166, 1)"
                                        ],
                                        hoverBorderWidth: 3
                                    }
                                ]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        backgroundColor: "rgba(31, 41, 55, 0.95)",
                                        titleColor: "#ffffff",
                                        bodyColor: "#e5e7eb",
                                        borderWidth: 1,
                                        borderColor: "rgba(34, 197, 94, 0.5)",
                                        cornerRadius: 12,
                                        displayColors: true,
                                        titleFont: {
                                            size: 14,
                                            weight: "bold"
                                        },
                                        bodyFont: {
                                            size: 13
                                        },
                                        padding: 12
                                    }
                                },
                                animation: {
                                    duration: 1200,
                                    easing: "easeOutQuart"
                                },
                                interaction: {
                                    intersect: false,
                                    mode: 'index'
                                },
                                scales: {
                                    x: {
                                        ticks: {
                                            color: "#374151",
                                            font: { 
                                                size: 14,
                                                weight: "600"
                                            }
                                        },
                                        grid: {
                                            display: false
                                        },
                                        border: {
                                            display: false
                                        }
                                    },
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            color: "#6B7280",
                                            font: { 
                                                size: 13,
                                                weight: "500"
                                            },
                                            stepSize: 1,
                                            callback: function(value) {
                                                return value + (value === 1 ? ' candidature' : ' candidatures');
                                            }
                                        },
                                        grid: {
                                            color: "rgba(34, 197, 94, 0.1)",
                                            lineWidth: 1
                                        },
                                        border: {
                                            display: false
                                        }
                                    }
                                }
                            }}
                            height={200}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
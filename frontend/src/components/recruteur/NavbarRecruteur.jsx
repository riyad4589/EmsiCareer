import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, Briefcase, User, LogOut, MessageCircle } from "lucide-react";

const NavbarRecruteur = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!user) return null;

    const navItems = [
        { path: "/RecruteurDashboard", icon: Home, label: "Accueil" },
        { path: "/recruteur/offres", icon: Briefcase, label: "Offres" },
        { path: "/recruteur/messages", icon: MessageCircle, label: "Messages" },
        { path: "/recruteur/profil", icon: User, label: "Profil" },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white border-b z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/RecruteurDashboard" className="flex-shrink-0">
                            <img
                                src="/logo-emsi.png"
                                alt="Portail EMSI"
                                className="h-14 max-h-16 w-auto object-contain"
                            />
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    title={item.label}
                                    className={`relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                        isActive ? "text-green-600 bg-green-100" : "text-gray-600 hover:text-green-600 hover:bg-green-100"
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="ml-2 hidden sm:inline">{item.label}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                            title="Déconnexion"
                        >
                            <LogOut className="mr-2 h-5 w-5" />
                            <span className="hidden sm:inline">Déconnexion</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavbarRecruteur; 
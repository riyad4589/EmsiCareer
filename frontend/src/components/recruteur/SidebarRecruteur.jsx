import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Home, Briefcase, User, LogOut, MessageCircle } from "lucide-react";

const SidebarRecruteur = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
        }
    };

    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) => `
        flex items-center py-2 px-3 rounded-md font-medium transition-all duration-200
        ${isActive(path)
            ? "bg-success/10 text-success border-l-4 border-success"
            : "text-gray-600 hover:bg-gray-100 hover:text-success"}
    `;

    return (
        <div className="mt-6 mx-4 rounded-xl shadow-sm bg-white overflow-hidden">
            <div className="p-4 text-center border-b">
                <div
                    className="h-16 bg-cover bg-center relative rounded-t-xl"
                    style={{
                        backgroundImage: `url("${user?.babanniere || "/banner.png"}")`,
                    }}
                >
                    <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-xl" />
                </div>
                <Link className="group relative block -mt-8">
                    <img
                        src={user?.companyLogo || "/avatar.png"}
                        alt={user?.name}
                        className="w-16 h-16 rounded-full border-4 border-white mx-auto object-cover shadow-md transition-transform duration-200 group-hover:scale-105"
                    />
                </Link>
                <p className="text-sm font-semibold text-gray-800 mt-2">{user?.company}</p>
            </div>

            <div className="p-4">
                <nav>
                    <ul className="space-y-1">
                        <li>
                            <Link
                                to="/RecruteurDashboard"
                                className={navLinkClass('/RecruteurDashboard')}
                            >
                                <Home className="mr-2" size={18} /> Accueil
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/recruteur/offres"
                                className={navLinkClass('/recruteur/offres')}
                            >
                                <Briefcase className="mr-2" size={18} /> Offres
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/recruteur/messages"
                                className={navLinkClass('/recruteur/messages')}
                            >
                                <MessageCircle className="mr-2" size={18} /> Messagerie
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/recruteur/profil"
                                className={navLinkClass('/recruteur/profil')}
                            >
                                <User className="mr-2" size={18} /> Profil
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className="flex items-center py-2 px-3 text-red-500 hover:bg-gray-100 hover:text-red-600 rounded-md w-full"
                            >
                                <LogOut className="mr-2" size={18} /> Se déconnecter
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default SidebarRecruteur;

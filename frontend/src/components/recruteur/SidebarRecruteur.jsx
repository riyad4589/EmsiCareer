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

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navLinkClass = (path) => {
        return `flex items-center py-2 px-3 rounded-md transition-colors ${
            isActive(path)
                ? "bg-success text-white"
                : "hover:bg-base-200 text-info hover:text-success"
        }`;
    };

    return (
        <div className="mt-6 mx-4 rounded-lg shadow bg-white">
            <div className='p-3 text-center'>
                <div
                    className='h-16 rounded-t-lg bg-cover bg-center relative'
                    style={{
                        backgroundImage: `url("${user?.babanniere || "/banner.png"}")`,
                    }}
                >
                    <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-lg" />
                </div>
                <Link className="group">
                    <div className="relative">
                        <img
                            src={user?.profilePicture || "/avatar.png"}
                            alt={user?.name}
                            className='w-16 h-16 rounded-full mx-auto mt-[-32px] border-4 border-white object-cover group-hover:border-success transition-colors duration-200'
                        />
                    </div>
                </Link>
                <p className='text-sm text-gray-600 mt-1 line-clamp-2'>{user?.company}</p>
            </div>
            <div className='border-t border-gray-100 p-3'>
                <nav>
                    <ul className='space-y-1'>
                        <li>
                            <Link
                                to='/RecruteurDashboard'
                                className={navLinkClass('/RecruteurDashboard')}
                            >
                                <Home className='mr-2' size={18} /> Accueil
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='/recruteur/offres'
                                className={navLinkClass('/recruteur/offres')}
                            >
                                <Briefcase className='mr-2' size={18} /> Offres
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='/recruteur/messages'
                                className={navLinkClass('/recruteur/messages')}
                            >
                                <MessageCircle className='mr-2' size={18} /> Messagerie
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='/recruteur/profil'
                                className={navLinkClass('/recruteur/profil')}
                            >
                                <User className='mr-2' size={18} /> Profil
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className='flex items-center py-2 px-3 rounded-md transition-colors w-full hover:bg-base-200 text-red-500 hover:text-red-600'
                            >
                                <LogOut className='mr-2' size={18} /> Se déconnecter
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default SidebarRecruteur; 
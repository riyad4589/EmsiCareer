import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, Briefcase, User, LogOut, MessageCircle } from "lucide-react";

const NavbarRecruteur = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
        }
    };

    const navLinkClass = (path) => {
        return `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            location.pathname === path
                ? "text-green-600 bg-green-100"
                : "text-gray-600 hover:text-green-600 hover:bg-green-100"
        }`;
    };

    return (
        <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-10">
            <div className="h-full px-4 flex items-center justify-end">
                <div className="flex items-center space-x-4">
                <Link to="/RecruteurDashboard" className={navLinkClass("/RecruteurDashboard")}><Home size={18} /></Link>
                <Link to="/recruteur/offres" className={navLinkClass("/recruteur/offres")}><Briefcase size={18} /></Link>
                <Link to="/recruteur/messages" className={navLinkClass("/recruteur/messages")}><MessageCircle size={18} /></Link>
                <Link to="/recruteur/profil" className={navLinkClass("/recruteur/profil")}><User size={18} /></Link>
                <button onClick={handleLogout} className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:text-red-600 transition-colors"> <LogOut className="mr-2" size={18} /></button>
                </div>
            </div>
        </div>
    );
};

export default NavbarRecruteur; 
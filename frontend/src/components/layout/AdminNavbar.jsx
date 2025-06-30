import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link, useNavigate } from "react-router-dom";
import { Users, FileText, LogOut, Home, ScrollText, Building2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const AdminNavbar = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { logout: authLogout } = useAuth();

	const { mutate: handleLogout } = useMutation({
		mutationFn: () => axiosInstance.post("/auth/logout"),
		onSuccess: () => {
			localStorage.removeItem("token");
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			toast.success("Déconnexion réussie");
			navigate("/login");
		},
		onError: () => {
			localStorage.removeItem("token");
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			toast.success("Déconnexion réussie");
			navigate("/login");
		}
	});

	return (
		<nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
			<div className="max-w-7xl mx-auto px-4">
				<div className="flex justify-between h-16">
					<div className="flex items-center">
						<Link to="/admin" className="flex-shrink-0">
							<img
								className="h-8 w-auto"
								src="/logo1.png"
								alt="Admin Dashboard"
							/>
						</Link>
					</div>

					<div className="flex items-center space-x-4">
						<Link
							to="/admin"
							className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-success hover:bg-success/10 transition-colors duration-200"
						>
							<Home className="h-5 w-5 mr-2" />
							Accueil
						</Link>
						<Link
							to="/admin/users"
							className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-success hover:bg-success/10 transition-colors duration-200"
						>
							<Users className="h-5 w-5 mr-2" />
							Utilisateurs
						</Link>
						<Link
							to="/admin/recruiters"
							className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-success hover:bg-success/10 transition-colors duration-200"
						>
							<Building2 className="h-5 w-5 mr-2" />
							Recruteurs
						</Link>
						<Link
							to="/admin/posts"
							className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-success hover:bg-success/10 transition-colors duration-200"
						>
							<FileText className="h-5 w-5 mr-2" />
							Posts
						</Link>
						<Link
							to="/admin/offers"
							className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-success hover:bg-success/10 transition-colors duration-200"
						>
							<ScrollText className="h-5 w-5 mr-2" />
							Offers
						</Link>
						<button
							onClick={() => handleLogout()}
							className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
						>
							<LogOut className="h-5 w-5 mr-2" />
							Déconnexion
						</button>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default AdminNavbar; 
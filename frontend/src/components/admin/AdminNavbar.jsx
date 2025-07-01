import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, Users, FileText, LayoutDashboard, Briefcase, LogOut } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";

const AdminNavbar = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const navItems = [
		{
			title: "Tableau de bord",
			icon: LayoutDashboard,
			path: "/admin"
		},
		{
			title: "Utilisateurs",
			icon: Users,
			path: "/admin/users"
		},
		{
			title: "Recruteurs",
			icon: Building2,
			path: "/admin/recruiters"
		},
		{
			title: "Posts",
			icon: FileText,
			path: "/admin/posts"
		},
		{
			title: "Offres",
			icon: Briefcase,
			path: "/admin/offers"
		}
	];

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
		<nav className="fixed top-0 left-0 right-0 bg-white border-b z-50">
			<div className="max-w-7xl mx-auto px-4">
				<div className="flex justify-between h-16">
					<div className="flex items-center">
						<Link to="/admin" className="flex-shrink-0">
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
									title={item.title}
									className={`relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
										isActive ? "text-green-600 bg-green-100" : "text-gray-600 hover:text-green-600 hover:bg-green-100"
									}`}
								>
									<Icon className="h-5 w-5" />
									<span className="ml-2 hidden sm:inline">{item.title}</span>
								</Link>
							);
						})}
						<button
							onClick={() => handleLogout()}
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

export default AdminNavbar; 
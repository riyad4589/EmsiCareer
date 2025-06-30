import { Link, useLocation } from "react-router-dom";
import { Building2, Users, FileText, LayoutDashboard, Briefcase } from "lucide-react";

const AdminNavbar = () => {
	const location = useLocation();

	const isActive = (path) => {
		return location.pathname === path;
	};

	const navItems = [
		{
			title: "Tableau de bord",
			icon: <LayoutDashboard className="w-5 h-5" />,
			path: "/admin"
		},
		{
			title: "Utilisateurs",
			icon: <Users className="w-5 h-5" />,
			path: "/admin/users"
		},
		{
			title: "Recruteurs",
			icon: <Building2 className="w-5 h-5" />,
			path: "/admin/recruiters"
		},
		{
			title: "Posts",
			icon: <FileText className="w-5 h-5" />,
			path: "/admin/posts"
		},
		{
			title: "Offres",
			icon: <Briefcase className="w-5 h-5" />,
			path: "/admin/offers"
		}
	];

	return (
		<nav className="bg-white shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex">
						<div className="flex-shrink-0 flex items-center">
							<h1 className="text-xl font-bold text-gray-900">Administration</h1>
						</div>
						<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
							{navItems.map((item) => (
								<Link
									key={item.path}
									to={item.path}
									className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
										isActive(item.path)
											? "border-green-500 text-gray-900"
											: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
									}`}
								>
									{item.icon}
									<span className="ml-2">{item.title}</span>
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default AdminNavbar; 
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Home, Users, MessageSquare, Bell, User, Briefcase } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

const Navbar = () => {
	const { user } = useAuth();
	const location = useLocation();

	const { data: unreadNotifications } = useQuery({
		queryKey: ["unreadNotifications"],
		queryFn: async () => {
			const response = await axiosInstance.get("/notifications/unread-count");
			return response.data;
		},
	});

	const { data: unreadMessages } = useQuery({
		queryKey: ["unreadMessages"],
		queryFn: async () => {
			const response = await axiosInstance.get("/messages/unread/count");
			return response.data;
		},
	});

	const { data: receivedConnections } = useQuery({
		queryKey: ["receivedConnections"],
		queryFn: async () => {
			const response = await axiosInstance.get("/connections/requests");
			const receivedRequests = response.data.data.filter(
				(request) => request.recipient._id === user._id
			);
			return { data: receivedRequests };
		},
	});

	if (!user) return null;

	const navItems = [
		{ path: "/", icon: Home, label: "Accueil" },
		{ path: "/network", icon: Users, label: "Réseau" },
		{ path: "/job-offers", icon: Briefcase, label: "Offres" },
		{ path: "/messages", icon: MessageSquare, label: "Messages" },
		{ path: "/notifications", icon: Bell, label: "Notifications" },
		{ path: `/profile/${user.username}`, icon: User, label: "Profil" },
	];

	return (
		<nav className="fixed top-0 left-0 right-0 bg-white border-b z-50">
			<div className="max-w-7xl mx-auto px-4">
				<div className="flex justify-between h-16">
					<div className="flex items-center">
					<Link to="/" className="flex-shrink-0">
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
									className={`relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
										${isActive ? "text-green-600 bg-green-100" : "text-gray-600 hover:text-green-600 hover:bg-green-100"}`}
								>
									<Icon className="h-5 w-5" />

									{/* Badges */}
									{item.path === "/notifications" && unreadNotifications?.count > 0 && (
										<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
											{unreadNotifications.count}
										</span>
									)}
									{item.path === "/messages" && unreadMessages?.count > 0 && (
										<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
											{unreadMessages.count}
										</span>
									)}
									{item.path === "/network" && receivedConnections?.data?.length > 0 && (
										<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
											{receivedConnections.data.length}
										</span>
									)}
								</Link>
							);
						})}
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
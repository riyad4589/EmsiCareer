import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, UserPlus, Bell, User, MessageSquare, LogOut, Briefcase } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar({ user }) {
	const location = useLocation();
	const navigate = useNavigate();
	const { logout } = useAuth();

	const isActive = (path) => location.pathname === path;

	const navLinkClass = (path) =>
		`flex items-center py-2 px-3 rounded-md transition-colors ${
			isActive(path)
				? "bg-success text-white"
				: "hover:bg-base-200 text-info hover:text-success"
		}`;

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<div className="bg-white rounded-lg shadow sticky top-4 overflow-hidden">
			{/* ░░░ BANNIÈRE ░░░ */}
			<div className="relative h-24 w-full">
				<img
					src={user.banniere || "/banner.png"}
					alt="Bannière de profil"
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60 opacity-60" />
			</div>

			{/* ░░░ AVATAR + NOM + HEADLINE ░░░ */}
			<div className="relative -mt-10 px-4 text-center">
				<Link to={`/profile/${user.username}`} className="group block">
					<div className="relative w-fit mx-auto">
						<img
							src={user.profilePicture || "/avatar.png"}
							alt={user.name}
							className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md"
						/>
					</div>
					<h2 className="text-lg font-semibold mt-2 text-gray-900 group-hover:text-success transition-colors">
						{user.name}
					</h2>
				</Link>
				{user.headline && (
					<p className="text-sm text-gray-500 mt-1 line-clamp-2">{user.headline}</p>
				)}
			</div>

			{/* ░░░ NAVIGATION ░░░ */}
			<div className="border-t border-gray-100 p-3">
				<nav>
					<ul className="space-y-1">
						<li>
							<Link to="/home" className={navLinkClass("/home")}>
								<Home className="mr-2" size={18} /> Accueil
							</Link>
						</li>
						<li>
							<Link to="/network" className={navLinkClass("/network")}>
								<UserPlus className="mr-2" size={18} /> Mon réseau
							</Link>
						</li>
						<li>
							<Link to="/job-offers" className={navLinkClass("/job-offers")}>
								<Briefcase className="mr-2" size={18} /> Offres D'emploi
							</Link>
						</li>
						<li>
							<Link to="/messages" className={navLinkClass("/messages")}>
								<MessageSquare className="mr-2" size={18} /> Messages
							</Link>
						</li>
						<li>
							<Link to="/notifications" className={navLinkClass("/notifications")}>
								<Bell className="mr-2" size={18} /> Notifications
							</Link>
						</li>
						<li>
							<Link to={`/profile/${user.username}`} className={navLinkClass(`/profile/${user.username}`)}>
								<User className="mr-2" size={18} /> Voir le profil
							</Link>
						</li>
						<li>
							<button
								onClick={handleLogout}
								className="flex items-center py-2 px-3 rounded-md transition-colors w-full hover:bg-base-200 text-red-500 hover:text-red-600"
							>
								<LogOut className="mr-2" size={18} /> Se déconnecter
							</button>
						</li>
					</ul>
				</nav>
			</div>
		</div>
	);
}

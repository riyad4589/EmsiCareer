import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, UserPlus, Bell, User, MessageSquare, LogOut, Briefcase } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar({ user }) {
	const location = useLocation();
	const navigate = useNavigate();
	const { logout } = useAuth();

	const isActive = (path) => {
		return location.pathname === path;
	};

	const navLinkClass = (path) => {
		return `flex items-center py-2 px-3 rounded-md transition-colors ${
			isActive(path)
				? "bg-primary text-white"
				: "hover:bg-base-200 text-info hover:text-primary"
		}`;
	};

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<div className='bg-white rounded-lg shadow sticky top-4 '>
			<div className='p-3 text-center'>
				<div
					className='h-16 rounded-t-lg bg-cover bg-center relative'
					style={{
						backgroundImage: `url("${user.bannerImg || "/banner.png"}")`,
					}}
				>
					<div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-lg" />
				</div>
				<Link to={`/profile/${user.username}`} className="group">
					<div className="relative">
						<img
							src={user.profilePicture || "/avatar.png"}
							alt={user.name}
							className='w-16 h-16 rounded-full mx-auto mt-[-32px] border-4 border-white object-cover group-hover:border-primary transition-colors duration-200'
						/>
						<div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
							<span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-medium">
								Voir le profil
							</span>
						</div>
					</div>
					<h2 className='text-lg font-semibold mt-2 group-hover:text-primary transition-colors duration-200'>{user.name}</h2>
				</Link>
				<p className='text-sm text-gray-600 mt-1 line-clamp-2'>{user.headline}</p>
			</div>
			<div className='border-t border-gray-100 p-3'>
				<nav>
					<ul className='space-y-1'>
						<li>
							<Link
								to='/home'
								className={navLinkClass('/home')}
							>
								<Home className='mr-2' size={18} /> Accueil
							</Link>
						</li>
						<li>
							<Link
								to='/network'
								className={navLinkClass('/network')}
							>
								<UserPlus className='mr-2' size={18} /> Mon réseau
							</Link>
						</li>
						<li>
							<Link
								to='/job-offers'
								className={navLinkClass('/job-offers')}
							>
								<Briefcase className='mr-2' size={18} /> Offres D'emploi
							</Link>
						</li>
						<li>
							<Link
								to='/messages'
								className={navLinkClass('/messages')}
							>
								<MessageSquare className='mr-2' size={18} /> Messages
							</Link>
						</li>
						<li>
							<Link
								to='/notifications'
								className={navLinkClass('/notifications')}
							>
								<Bell className='mr-2' size={18} /> Notifications
							</Link>
						</li>
						<li>
							<Link
								to={`/profile/${user.username}`}
								className={navLinkClass(`/profile/${user.username}`)}
							>
								<User className='mr-2' size={18} /> Voir le profil
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
}

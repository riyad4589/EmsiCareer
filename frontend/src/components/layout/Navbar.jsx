import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Home, LogOut, User, Users, MessageSquare, Briefcase, LogIn } from "lucide-react";
import { toast } from "react-hot-toast";

const Navbar = () => {
	const { data: authUser } = useQuery({ 
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
				const res = await axiosInstance.get("/auth/me");
				return res.data;
			} catch (error) {
				return null;
			}
		},
		retry: false,
	 });
	const queryClient = useQueryClient();
	const location = useLocation();
	const navigate = useNavigate();

	const { data: notifications } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			const res = await axiosInstance.get("/notifications");
			return res.data.data;
		},
		enabled: !!authUser,
	});

	const { data: connectionRequests } = useQuery({
		queryKey: ["connectionRequests"],
		queryFn: async () => axiosInstance.get("/connections/requests"),
		enabled: !!authUser,
	});

	const { mutate: logout } = useMutation({
		mutationFn: () => axiosInstance.post("/auth/logout"),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			toast.success("Déconnexion réussie");
			navigate("/login");
		},
		onError: () => {
			toast.error("Erreur lors de la déconnexion");
		},
	});

	const unreadNotificationCount = Array.isArray(notifications)
		? notifications.filter((notif) => !notif.read).length
		: 0;
	const unreadConnectionRequestsCount = connectionRequests?.data?.data?.length || 0;

	const isActive = (path) => {
		return location.pathname === path;
	};

	const navLinkClass = (path) => {
		return `flex flex-col items-center transition-colors duration-200 ${
			isActive(path)
				? "text-success"
				: "text-neutral hover:text-success"
		}`;
	};

	return (
		<nav className='bg-secondary shadow-md sticky top-0 z-10'>
			<div className='max-w-7xl mx-auto px-4'>
				<div className='flex justify-between items-center py-3'>
					<div className='flex items-center space-x-4'>
						<Link to='/'>
							<img
							src="/logo_emsi.png"
							alt="Portail EMSI"
							className="h-12 max-h-16 w-auto rounded hover:opacity-90 transition-opacity duration-200 object-contain"
							/>
						</Link>
					</div>
					<div className='flex items-center gap-2 md:gap-6'>
						{authUser ? (
							<>
								<Link to={"/"} className={navLinkClass("/")}>
									<Home size={20} />
									<span className='text-xs hidden md:block'>Accueil</span>
								</Link>
								<Link to='/network' className={`${navLinkClass("/network")} relative`}>
									<Users size={20} />
									<span className='text-xs hidden md:block'>Réseau</span>
									{unreadConnectionRequestsCount > 0 && (
										<span
											className='absolute -top-1 -right-1 md:right-4 bg-success text-white text-xs 
											rounded-full size-3 md:size-4 flex items-center justify-center animate-pulse'
										>
											{unreadConnectionRequestsCount}
										</span>
									)}
								</Link>
								<Link to='/job-offers' className={navLinkClass('/job-offers')}>
									<Briefcase size={20} />
									<span className='text-xs hidden md:block'>Offres d'emploi</span>
								</Link>
								<Link to='/messages' className={navLinkClass("/messages")}>
									<MessageSquare size={20} />
									<span className='text-xs hidden md:block'>Messages</span>
								</Link>
								<Link to='/notifications' className={`${navLinkClass("/notifications")} relative`}>
									<Bell size={20} />
									<span className='text-xs hidden md:block'>Notifications</span>
									{unreadNotificationCount > 0 && (
										<span
											className='absolute -top-1 -right-1 md:right-4 bg-success text-white text-xs 
											rounded-full size-3 md:size-4 flex items-center justify-center animate-pulse'
										>
											{unreadNotificationCount}
										</span>
									)}
								</Link>
								<Link
									to={`/profile/${authUser.username}`}
									className={navLinkClass(`/profile/${authUser.username}`)}
								>
									<User size={20} />
									<span className='text-xs hidden md:block'>Profil</span>
								</Link>
							</>
							
						) : (
							<Link to='/login' className={navLinkClass('/login')}>
								<LogIn size={20} />
								<span className='text-xs hidden md:block'>Connexion</span>
							</Link>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;

import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { UserPlus, UserCheck, Loader, Check } from "lucide-react";
import { invalidateConnectionQueries } from "../utils/queryUtils";

function UserCard({ user, isConnection, onConnect, isConnecting }) {
	const queryClient = useQueryClient();

	const { mutate: sendConnectionRequest, isPending: isSendingRequest } = useMutation({
		mutationFn: (userId) => axiosInstance.post(`/connections/request/${userId}`),
		onSuccess: () => {
			toast.success("Demande de connexion envoyée");
			queryClient.invalidateQueries(["connectionRequests"]);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Une erreur est survenue");
		},
	});

	const { mutate: removeConnection, isPending: isRemoving } = useMutation({
		mutationFn: (userId) => axiosInstance.delete(`/connections/${userId}`),
		onSuccess: () => {
			toast.success("Connexion supprimée");
			invalidateConnectionQueries(queryClient);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Une erreur est survenue");
		},
	});

	const handleConnectionAction = () => {
		if (isConnection) {
			removeConnection(user._id);
		} else {
			sendConnectionRequest(user._id);
		}
	};

	return (
		<div className='bg-secondary rounded-lg shadow p-4 flex flex-col items-center transition-all hover:shadow-lg group'>
			<Link to={`/profile/${user.username}`} className='flex flex-col items-center group'>
				<div className="relative">
					<img
						src={user.profilePicture || "/avatar.png"}
						alt={user.name}
						className='w-24 h-24 rounded-full object-cover mb-4 border-2 border-transparent group-hover:border-primary transition-colors duration-200'
					/>
					<div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
						<span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-medium">
							Voir le profil
						</span>
					</div>
				</div>
				<h3 className='font-semibold text-lg text-center group-hover:text-primary transition-colors duration-200'>{user.name}</h3>
			</Link>
			<p className='text-info text-center mt-1'>{user.headline}</p>
			<button 
				onClick={onConnect}
				disabled={isConnecting}
				className='mt-4 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition-colors w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
			>
				{isConnection ? (
					<>
						<Check size={16} />
						<span>Connecté</span>
					</>
				) : (
					<>
						<UserPlus size={16} />
						<span>Se connecter</span>
					</>
				)}
			</button>
		</div>
	);
}

export default UserCard;

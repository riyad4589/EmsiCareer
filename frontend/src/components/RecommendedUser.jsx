import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Check, Clock, UserCheck, UserPlus, X, Loader } from "lucide-react";

const RecommendedUser = ({ user }) => {
	const queryClient = useQueryClient();

	const { data: connectionStatus, isLoading } = useQuery({
		queryKey: ["connectionStatus", user._id],
		queryFn: () => axiosInstance.get(`/connections/status/${user._id}`),
	});

	const { mutate: sendConnectionRequest, isPending: isSendingRequest } = useMutation({
		mutationFn: (userId) => axiosInstance.post(`/connections/request/${userId}`),
		onSuccess: () => {
			toast.success("Demande de connexion envoyée avec succès");
			queryClient.invalidateQueries({ queryKey: ["connectionStatus", user._id] });
		},
		onError: (error) => {
			toast.error(error.response?.data?.error || "Une erreur est survenue");
		},
	});

	const { mutate: acceptRequest, isPending: isAccepting } = useMutation({
		mutationFn: (requestId) => axiosInstance.post(`/connections/accept/${requestId}`),
		onSuccess: () => {
			toast.success("Demande de connexion acceptée");
			queryClient.invalidateQueries({ queryKey: ["connectionStatus", user._id] });
		},
		onError: (error) => {
			toast.error(error.response?.data?.error || "Une erreur est survenue");
		},
	});

	const { mutate: rejectRequest, isPending: isRejecting } = useMutation({
		mutationFn: (requestId) => axiosInstance.post(`/connections/reject/${requestId}`),
		onSuccess: () => {
			toast.success("Demande de connexion refusée");
			queryClient.invalidateQueries({ queryKey: ["connectionStatus", user._id] });
		},
		onError: (error) => {
			toast.error(error.response?.data?.error || "Une erreur est survenue");
		},
	});

	const renderButton = () => {
		if (isLoading) {
			return (
				<button className='px-3 py-1 rounded-full text-sm bg-base-100 text-info flex items-center justify-center' disabled>
					<Loader size={16} className="animate-spin mr-1" />
					Chargement...
				</button>
			);
		}

		switch (connectionStatus?.data?.status) {
			case "pending":
				return (
					<button
						className='px-3 py-1 rounded-full text-sm bg-yellow-500 text-white flex items-center justify-center'
						disabled
					>
						<Clock size={16} className='mr-1' />
						En attente
					</button>
				);
			case "received":
				return (
					<div className='flex gap-2 justify-center'>
						<button
							onClick={() => acceptRequest(connectionStatus.data.requestId)}
							disabled={isAccepting}
							className={`rounded-full p-1 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white transition-colors duration-200`}
						>
							{isAccepting ? (
								<Loader size={16} className="animate-spin" />
							) : (
								<Check size={16} />
							)}
						</button>
						<button
							onClick={() => rejectRequest(connectionStatus.data.requestId)}
							disabled={isRejecting}
							className={`rounded-full p-1 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors duration-200`}
						>
							{isRejecting ? (
								<Loader size={16} className="animate-spin" />
							) : (
								<X size={16} />
							)}
						</button>
					</div>
				);
			case "connected":
				return (
					<button
						className='px-3 py-1 rounded-full text-sm bg-green-500 text-white flex items-center justify-center'
						disabled
					>
						<UserCheck size={16} className='mr-1' />
						Connecté
					</button>
				);
			default:
				return (
					<button
						className='px-3 py-1 rounded-full text-sm border border-success text-success hover:bg-success hover:text-white transition-colors duration-200 flex items-center justify-center'
						onClick={handleConnect}
						disabled={isSendingRequest}
					>
						{isSendingRequest ? (
							<>
								<Loader size={16} className="animate-spin mr-1" />
								Envoi...
							</>
						) : (
							<>
								<UserPlus size={16} className='mr-1' />
								Se connecter
							</>
						)}
					</button>
				);
		}
	};

	const handleConnect = () => {
		if (connectionStatus?.data?.status === "not_connected") {
			sendConnectionRequest(user._id);
		}
	};

	return (
		<div className='flex items-center justify-between mb-4 p-3 rounded-lg hover:bg-base-100 transition-colors duration-200'>
			<Link to={`/profile/${user.username}`} className='flex items-center flex-grow group'>
				<div className="relative">
					<img
						src={user.profilePicture || "/avatar.png"}
						alt={user.name}
						className='w-12 h-12 rounded-full mr-3 object-cover border-2 border-transparent group-hover:border-success transition-colors duration-200'
					/>
					<div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
						<span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-medium">
							Voir le profil
						</span>
					</div>
				</div>
				<div>
					<h3 className='font-semibold text-sm group-hover:text-success transition-colors duration-200'>{user.name}</h3>
					<p className='text-xs text-info'>{user.headline}</p>
				</div>
			</Link>
			{renderButton()}
		</div>
	);
};

export default RecommendedUser;

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Check, X, Loader, User } from "lucide-react";

const Avatar = ({ user, className = "" }) => {
	if (user.profilePicture) {
		return (
			<img
				src={user.profilePicture}
				alt={user.name}
				className={`rounded-full object-cover ${className}`}
			/>
		);
	}

	// Extraire les initiales du nom
	const initials = user.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<div
			className={`flex items-center justify-center rounded-full bg-green-100 text-green-600 font-medium ${className}`}
		>
			{initials || <User size={20} />}
		</div>
	);
};

const FriendRequest = ({ request }) => {
	const queryClient = useQueryClient();

	const { mutate: acceptConnectionRequest, isPending: isAccepting } = useMutation({
		mutationFn: (requestId) => axiosInstance.post(`/connections/accept/${requestId}`),
		onSuccess: () => {
			toast.success("Demande de connexion acceptée");
			queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Une erreur est survenue");
		},
	});

	const { mutate: rejectConnectionRequest, isPending: isRejecting } = useMutation({
		mutationFn: (requestId) => axiosInstance.post(`/connections/reject/${requestId}`),
		onSuccess: () => {
			toast.success("Demande de connexion refusée");
			queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Une erreur est survenue");
		},
	});

	return (
		<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
			<Link to={`/profile/${request.sender._id}`} className="flex items-center space-x-3">
				<Avatar user={request.sender} className="w-10 h-10" />
				<div>
					<h3 className="font-medium text-gray-900">{request.sender.name}</h3>
					<p className="text-sm text-gray-500">{request.sender.headline}</p>
				</div>
			</Link>
			<div className="flex gap-2">
				<button
					className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2 min-w-[100px]"
					onClick={() => acceptConnectionRequest(request._id)}
					disabled={isAccepting || isRejecting}
				>
					{isAccepting ? (
						<>
							<Loader size={20} className="animate-spin" />
							Acceptation...
						</>
					) : (
						<>
							<Check size={20} />
							Accepter
						</>
					)}
				</button>
				<button
					className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2 min-w-[100px]"
					onClick={() => rejectConnectionRequest(request._id)}
					disabled={isAccepting || isRejecting}
				>
					{isRejecting ? (
						<>
							<Loader size={20} className="animate-spin" />
							Refus...
						</>
					) : (
						<>
							<X size={20} />
							Refuser
						</>
					)}
				</button>
			</div>
		</div>
	);
};

export default FriendRequest;

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { UserPlus, Loader, User } from "lucide-react";
import { toast } from "react-hot-toast";

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

const RecommendedUsers = () => {
	const queryClient = useQueryClient();

	const { data: suggestions, isLoading } = useQuery({
		queryKey: ["suggestions"],
		queryFn: async () => {
			const response = await axiosInstance.get("/users/suggestions");
			return response.data;
		},
	});

	const connectMutation = useMutation({
		mutationFn: (userId) => axiosInstance.post(`/connections/request/${userId}`),
		onSuccess: (_, userId) => {
			// Mettre à jour le cache pour marquer l'utilisateur comme en attente
			queryClient.setQueryData(["suggestions"], (oldData) => {
				if (!oldData?.data) return oldData;
				return {
					...oldData,
					data: oldData.data.map((user) =>
						user._id === userId ? { ...user, status: "pending" } : user
					),
				};
			});
			toast.success("Demande de connexion envoyée");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Erreur lors de l'envoi de la demande");
		},
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-4">
				<Loader className="animate-spin" />
			</div>
		);
	}

	if (!suggestions?.data?.length) {
		return (
			<div className="p-4 text-center text-gray-500">
				Aucune suggestion pour le moment
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold mb-4">Suggestions</h2>
			{suggestions.data.map((user) => (
				<div
					key={user._id}
					className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
				>
					<div className="flex items-center space-x-3">
						<Avatar user={user} className="w-10 h-10" />
						<div>
							<h3 className="font-medium text-gray-900">{user.name}</h3>
							<p className="text-sm text-gray-500">{user.headline}</p>
						</div>
					</div>
					<button
						onClick={() => connectMutation.mutate(user._id)}
						disabled={connectMutation.isPending || user.status === "pending"}
						className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
							user.status === "pending"
								? "bg-gray-100 text-gray-500 cursor-not-allowed"
								: "bg-green-50 text-green-600 hover:bg-green-100"
						}`}
					>
						{connectMutation.isPending && user._id === connectMutation.variables ? (
							<Loader size={16} className="animate-spin" />
						) : (
							<UserPlus size={16} />
						)}
					</button>
				</div>
			))}
		</div>
	);
};

export default RecommendedUsers; 
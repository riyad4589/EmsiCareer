import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Spinner } from "../components/ui/spinner";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { Check, X, Loader, MessageSquare, UserMinus, UserPlus, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { invalidateConnectionQueries } from "../utils/queryUtils";

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

const NetworkPage = () => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { data: connectionsData, isLoading: connectionsLoading } = useQuery({
		queryKey: ["connections"],
		queryFn: async () => {
			const response = await axiosInstance.get("/connections/friends");
			return response.data.data;
		},
		enabled: !!user,
	});

	const { data: suggestionsData, isLoading: suggestionsLoading } = useQuery({
		queryKey: ["suggestions"],
		queryFn: async () => {
			const response = await axiosInstance.get("/users/suggestions");
			return response.data;
		},
		enabled: !!user,
	});

	const { data: connectionRequestsData, isLoading: requestsLoading } = useQuery({
		queryKey: ["connectionRequests"],
		queryFn: async () => {
			const response = await axiosInstance.get("/connections/requests");
			return response.data;
		},
		enabled: !!user,
	});

	const connectMutation = useMutation({
		mutationFn: async (userId) => {
			const response = await axiosInstance.post(`/connections/request/${userId}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["connections"]);
			queryClient.invalidateQueries(["suggestions"]);
			toast.success("Demande de connexion envoyée avec succès");
		},
		onError: (error) => {
			console.error("Erreur lors de la connexion:", error);
			toast.error(error.response?.data?.message || "Erreur lors de l'envoi de la demande");
		},
	});

	const acceptMutation = useMutation({
		mutationFn: async (requestId) => {
			const response = await axiosInstance.post(`/connections/accept/${requestId}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["connections"]);
			queryClient.invalidateQueries(["connectionRequests"]);
			queryClient.invalidateQueries(["suggestions"]);
			toast.success("Demande de connexion acceptée");
		},
		onError: (error) => {
			console.error("Erreur lors de l'acceptation:", error);
			toast.error(error.response?.data?.message || "Erreur lors de l'acceptation de la demande");
		},
	});

	const rejectMutation = useMutation({
		mutationFn: async (requestId) => {
			const response = await axiosInstance.post(`/connections/reject/${requestId}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["connectionRequests"]);
			toast.success("Demande de connexion refusée");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Erreur lors du refus de la demande");
		},
	});

	const removeConnectionMutation = useMutation({
		mutationFn: async (userId) => {
			const response = await axiosInstance.delete(`/connections/${userId}`);
			return response.data;
		},
		onSuccess: (data) => {
			// Invalider toutes les requêtes pertinentes
			invalidateConnectionQueries(queryClient);
			toast.success("Connexion supprimée avec succès");
		},
		onError: (error) => {
			console.error("Erreur lors de la suppression:", error);
			toast.error(error.response?.data?.message || "Erreur lors de la suppression de la connexion");
		}
	});

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-gray-600">Veuillez vous connecter pour voir votre réseau</p>
			</div>
		);
	}

	if (connectionsLoading || suggestionsLoading || requestsLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Spinner />
			</div>
		);
	}

	const connections = connectionsData || [];
	const suggestions = suggestionsData?.data || [];
	const connectionRequests = Array.isArray(connectionRequestsData?.data?.data)
		? connectionRequestsData.data.data
		: [];
	console.log("connectionRequestsData", connectionRequestsData);
	console.log("connectionRequests", connectionRequests);
	console.log("connections", connections);

	const handleConnect = (userId) => {
		connectMutation.mutate(userId);
	};

	const handleRemoveConnection = (userId) => {
		if (window.confirm("Êtes-vous sûr de vouloir supprimer cette connexion ?")) {
			removeConnectionMutation.mutate(userId);
		}
	};

	return (
		<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Demandes de connexion */}
				<div className="lg:col-span-2">
					<h2 className="text-2xl font-bold mb-6">Demandes de connexion</h2>
					<div className="bg-white rounded-lg shadow p-6">
						<div className="space-y-4">
							{connectionRequests.length === 0 ? (
								<div className="text-center text-gray-500">Aucune demande de connexion à afficher</div>
							) : (
								connectionRequests.map((request) => (
									<div
										key={request._id}
										className="flex items-center justify-between p-4 border rounded-lg"
									>
										<div className="flex items-center space-x-4">
											<img
												src={request.sender.profilePicture || "/default-avatar.png"}
												alt={request.sender.name}
												className="w-12 h-12 rounded-full"
											/>
											<div>
												<h3 className="font-medium">{request.sender.name}</h3>
												<p className="text-sm text-gray-500">
													{request.sender.headline}
												</p>
											</div>
										</div>
										<div className="flex gap-2">
											<button
												onClick={() => acceptMutation.mutate(request._id)}
												disabled={acceptMutation.isPending}
												className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
											>
												{acceptMutation.isPending ? (
													<>
														<Loader size={16} className="animate-spin" />
														Acceptation...
													</>
												) : (
													<>
														<Check size={16} />
														Accepter
													</>
												)}
											</button>
											<button
												onClick={() => rejectMutation.mutate(request._id)}
												disabled={rejectMutation.isPending}
												className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
											>
												{rejectMutation.isPending ? (
													<>
														<Loader size={16} className="animate-spin" />
														Refus...
													</>
												) : (
													<>
														<X size={16} />
														Refuser
													</>
												)}
											</button>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</div>

				{/* Connexions */}
				<div className="lg:col-span-2">
					<h2 className="text-2xl font-bold mb-6">Mes connexions ({connections.length})</h2>
					<div className="bg-white rounded-lg shadow p-6">
						{connectionsLoading ? (
							<div className="flex items-center justify-center p-8">
								<Spinner />
							</div>
						) : connections.length === 0 ? (
							<p className="text-center text-gray-500 font-semibold text-lg">Vous n'avez aucune connexion pour le moment.<br/>Acceptez des demandes ou connectez-vous avec d'autres utilisateurs pour les voir ici.</p>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{connections.map((connection) => (
									<div
										key={connection._id}
										className="flex items-center justify-between p-4 border rounded-lg"
									>
										<div className="flex items-center space-x-4">
											<Avatar user={connection} className="w-12 h-12" />
											<div>
												<h3 className="font-medium">{connection.name}</h3>
												<p className="text-sm text-gray-500">
													{connection.headline}
												</p>
											</div>
										</div>
										<div className="flex gap-2">
											<button
												onClick={() => navigate(`/messages/${connection._id}`)}
												className="p-2 text-green-600 hover:text-green-700"
											>
												<MessageSquare size={20} />
											</button>
											<button
												onClick={() => handleRemoveConnection(connection._id)}
												className="p-2 text-red-600 hover:text-red-700"
											>
												<UserMinus size={20} />
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Suggestions */}
				<div className="lg:col-span-1">
					<div className="bg-white rounded-lg shadow">
						<h2 className="text-xl font-semibold p-4 border-b">Suggestions</h2>
						<div className="p-4">
							{suggestionsLoading ? (
								<div className="flex items-center justify-center p-4">
									<Spinner />
								</div>
							) : suggestions.length === 0 ? (
								<p className="text-center text-gray-500">
									Aucune suggestion pour le moment
								</p>
							) : (
								<div className="space-y-4">
									{suggestions.map((suggestion) => (
										<div
											key={suggestion._id}
											className="flex items-center justify-between"
										>
											<div className="flex items-center space-x-3">
												<Avatar user={suggestion} className="w-10 h-10" />
												<div>
													<h3 className="font-medium text-gray-900">{suggestion.name}</h3>
													<p className="text-sm text-gray-500">
														{suggestion.headline}
													</p>
												</div>
											</div>
											<button
												onClick={() => handleConnect(suggestion._id)}
												disabled={connectMutation.isPending || suggestion.status === "pending"}
												className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
													suggestion.status === "pending"
														? "bg-gray-100 text-gray-500 cursor-not-allowed"
														: "bg-green-50 text-green-600 hover:bg-green-100"
												}`}
											>
												{connectMutation.isPending && suggestion._id === connectMutation.variables ? (
													<Loader size={16} className="animate-spin" />
												) : (
													<UserPlus size={16} />
												)}
											</button>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NetworkPage;

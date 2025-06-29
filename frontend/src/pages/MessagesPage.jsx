import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Spinner } from "../components/ui/spinner";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const MessagesPage = () => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const selectedUserId = searchParams.get("user");

	useEffect(() => {
		if (!user) {
			navigate("/login", { state: { from: "/messages" } });
			return;
		}
	}, [user, navigate]);

	const { data: conversations, isLoading: conversationsLoading } = useQuery({
		queryKey: ["conversations"],
		queryFn: async () => {
			const response = await axiosInstance.get("/messages/conversations");
			return response.data.data || [];
		},
		enabled: !!user,
	});

	const { data: messages, isLoading: messagesLoading } = useQuery({
		queryKey: ["messages", selectedUserId],
		queryFn: async () => {
			if (!selectedUserId) return [];
			const response = await axiosInstance.get(`/messages/${selectedUserId}`);
			return response.data.data || [];
		},
		enabled: !!user && !!selectedUserId,
	});

	const sendMessageMutation = useMutation({
		mutationFn: async (content) => {
			const response = await axiosInstance.post("/messages", {
				recipient: selectedUserId,
				content,
			});
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["messages", selectedUserId]);
			queryClient.invalidateQueries(["conversations"]);
		},
		onError: (error) => {
			console.error("Erreur lors de l'envoi du message:", error);
			toast.error(error.response?.data?.message || "Erreur lors de l'envoi du message");
		},
	});

	// Ajouter un log pour voir les messages après le fetch
	useEffect(() => {
		console.log("Messages récupérés:", messages);
	}, [messages]);

	// Ajouter un log pour voir les conversations après le fetch
	useEffect(() => {
		console.log("Conversations récupérées:", conversations);
	}, [conversations]);

	if (!user) {
		return null; // Le useEffect redirigera vers la page de login
	}

	if (conversationsLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Spinner />
			</div>
		);
	}

	const handleSendMessage = (e) => {
		e.preventDefault();
		const content = e.target.message.value.trim();
		if (content) {
			sendMessageMutation.mutate(content);
			e.target.message.value = "";
		}
	};

	return (
		<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Liste des conversations */}
				<div className="lg:col-span-1">
					<h2 className="text-2xl font-bold mb-6">Messages</h2>
					<div className="bg-white rounded-lg shadow">
						{!conversations || conversations.length === 0 ? (
							<p className="text-gray-600 text-center py-4">
								Aucune conversation
							</p>
						) : (
							<div className="divide-y">
								{conversations.map((conversation) => (
									<button
										key={conversation.user._id}
										onClick={() => navigate(`/messages?user=${conversation.user._id}`)}
										className={`w-full p-4 hover:bg-gray-50 transition-colors ${
											selectedUserId === conversation.user._id
												? "bg-gray-50"
												: ""
										}`}
									>
										<div className="flex items-center space-x-4">
											<img
												src={conversation.user.profilePicture || "/default-avatar.png"}
												alt={conversation.user.name}
												className="w-12 h-12 rounded-full object-cover"
											/>
											<div className="flex-1 text-left">
												<h3 className="font-medium">{conversation.user.name}</h3>
												<p className="text-sm text-gray-500 truncate">
													{conversation.lastMessage?.content}
												</p>
											</div>
											{conversation.unreadCount > 0 && (
												<span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
													{conversation.unreadCount}
												</span>
											)}
										</div>
									</button>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Zone de chat */}
				<div className="lg:col-span-2">
					{selectedUserId ? (
						<div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
							{messagesLoading ? (
								<div className="flex-1 flex items-center justify-center">
									<Spinner />
								</div>
							) : (
								<>
									<div className="flex-1 p-4 overflow-y-auto">
										{!messages || messages.length === 0 ? (
											<p className="text-gray-600 text-center py-4">
												Aucun message. Commencez la conversation !
											</p>
										) : (
											<div className="space-y-4">
												{messages.map((message) => (
													<div
														key={message._id}
														className={`flex ${
															message.sender._id === user._id
																? "justify-end"
																: "justify-start"
														}`}
													>
														<div
															className={`max-w-[70%] rounded-lg p-3 ${
																message.sender._id === user._id
																	? "bg-blue-600 text-white"
																	: "bg-gray-100"
															}`}
														>
															<p>{message.content}</p>
															<p className="text-xs mt-1 opacity-70">
																{new Date(message.createdAt).toLocaleTimeString()}
															</p>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
									<form onSubmit={handleSendMessage} className="p-4 border-t">
										<div className="flex space-x-4">
											<input
												type="text"
												name="message"
												placeholder="Écrivez votre message..."
												className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
											/>
											<button
												type="submit"
												disabled={sendMessageMutation.isPending}
												className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
											>
												{sendMessageMutation.isPending ? "Envoi..." : "Envoyer"}
											</button>
										</div>
									</form>
								</>
							)}
						</div>
					) : (
						<div className="bg-white rounded-lg shadow h-[600px] flex items-center justify-center">
							<p className="text-gray-600">
								Sélectionnez une conversation pour commencer à discuter
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default MessagesPage; 
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import ChatFriend from "../components/ChatFriend";
import Message from "../components/chat/Message";
import MessageInput from "../components/chat/MessageInput";
import { Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const ChatPage = () => {
	const { userId } = useParams();
	const queryClient = useQueryClient();
	const messagesEndRef = useRef(null);
	const [selectedUser, setSelectedUser] = useState(null);
	const socketRef = useRef(null);

	// Récupérer l'utilisateur connecté
	const { data: authUser } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			const response = await axiosInstance.get("/auth/me");
			return response.data;
		},
	});

	const { data: connections, isLoading: isLoadingConnections } = useQuery({
		queryKey: ["connections"],
		queryFn: async () => {
			const response = await axiosInstance.get("/connections/friends");
			return response.data.data;
		},
	});

	const { data: messages, isLoading: isLoadingMessages } = useQuery({
		queryKey: ["messages", userId],
		queryFn: async () => {
			const response = await axiosInstance.get(`/messages/${userId}`);
			return response.data.data;
		},
		enabled: !!userId,
	});

	// Initialiser Socket.IO
	useEffect(() => {
		if (authUser) {
			console.log("Initialisation de Socket.IO...");
			const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
				auth: {
					token: localStorage.getItem("token"),
				},
				withCredentials: true,
				transports: ["websocket"],
			});

			socket.on("connect", () => {
				console.log("Socket.IO connecté");
				socket.emit("join", authUser._id);
			});

			socket.on("connect_error", (error) => {
				console.error("Erreur de connexion Socket.IO:", error);
			});

			socket.on("newMessage", (message) => {
				console.log("Nouveau message reçu:", message);
				queryClient.invalidateQueries(["messages", userId]);
			});

			socket.on("messageReaction", (message) => {
				console.log("Nouvelle réaction reçue:", message);
				queryClient.invalidateQueries(["messages", userId]);
			});

			socketRef.current = socket;

			return () => {
				console.log("Déconnexion de Socket.IO");
				socket.disconnect();
			};
		}
	}, [authUser, queryClient, userId]);

	const sendMessageMutation = useMutation({
		mutationFn: async (messageData) => {
			console.log("Envoi du message:", messageData);
			if (!messageData.content || messageData.content.trim().length === 0) {
				throw new Error("Le message ne peut pas être vide");
			}

			// Vérifier d'abord la connexion
			console.log("Vérification de la connexion avec l'utilisateur:", userId);
			const connectionResponse = await axiosInstance.get(`/connections/status/${userId}`);
			console.log("Réponse complète de l'API:", connectionResponse);
			console.log("État de la connexion:", connectionResponse.data);

			// Vérifier si la connexion est acceptée
			if (connectionResponse.data.status !== "accepted") {
				console.log("Statut de connexion non accepté:", connectionResponse.data.status);
				throw new Error("Vous devez être connecté avec cette personne pour envoyer un message");
			}

			console.log("Connexion vérifiée, envoi du message...");
			const response = await axiosInstance.post("/messages", {
				recipient: userId,
				content: messageData.content.trim(),
			});
			return response.data;
		},
		onSuccess: (data) => {
			console.log("Message envoyé avec succès:", data);
			queryClient.invalidateQueries(["messages", userId]);
			toast.success("Message envoyé");
		},
		onError: (error) => {
			console.error("Erreur lors de l'envoi du message:", error);
			const errorMessage = error.response?.data?.message || error.message || "Erreur lors de l'envoi du message";
			toast.error(errorMessage);
		},
	});

	const reactToMessageMutation = useMutation({
		mutationFn: ({ messageId, emoji }) => {
			console.log("Ajout de réaction:", { messageId, emoji });
			return axiosInstance.post(`/messages/${messageId}/react`, { emoji });
		},
		onSuccess: () => {
			console.log("Réaction ajoutée avec succès");
			queryClient.invalidateQueries(["messages", userId]);
		},
		onError: (error) => {
			console.error("Erreur lors de l'ajout de la réaction:", error);
			toast.error("Erreur lors de l'ajout de la réaction");
		},
	});

	useEffect(() => {
		if (userId && connections) {
			const user = connections.find((conn) => conn._id === userId);
			setSelectedUser(user);
		}
	}, [userId, connections]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSendMessage = (messageData) => {
		console.log("Tentative d'envoi de message:", messageData);
		if (!messageData.content && !messageData.media) {
			toast.error("Le message ne peut pas être vide");
			return;
		}
		sendMessageMutation.mutate(messageData);
	};

	const handleReactToMessage = (messageId, emoji) => {
		console.log("Tentative d'ajout de réaction:", { messageId, emoji });
		reactToMessageMutation.mutate({ messageId, emoji });
	};

	if (isLoadingConnections) {
		return <div className="text-center py-10">Chargement...</div>;
	}

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<h1 className="text-2xl font-bold mb-6">Messages</h1>
			<div className="flex h-[600px]">
				{/* Chat List */}
				<div className="w-1/3 border-r border-gray-200 pr-4">
					<div className="mb-4 relative">
						<input
							type="text"
							placeholder="Rechercher des conversations..."
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-success"
						/>
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
					</div>
					<div className="space-y-2 overflow-y-auto h-[500px]">
						{connections?.length > 0 ? (
							connections.map((connection) => (
								<ChatFriend
									key={connection._id}
									user={connection}
									isSelected={connection._id === userId}
								/>
							))
						) : (
							<p className="text-gray-500 text-center">Aucune conversation</p>
						)}
					</div>
				</div>

				{/* Chat Window */}
				<div className="w-2/3 pl-4">
					<div className="flex flex-col h-full">
						{/* Chat Header */}
						<div className="border-b border-gray-200 pb-4 mb-4">
							{selectedUser ? (
								<div className="flex items-center gap-3">
									<img
										src={selectedUser.profilePicture || "/avatar.png"}
										alt={selectedUser.name}
										className="w-10 h-10 rounded-full"
									/>
									<div>
										<h2 className="text-xl font-semibold">{selectedUser.name}</h2>
										<p className="text-sm text-gray-500">{selectedUser.headline}</p>
									</div>
								</div>
							) : (
								<h2 className="text-xl font-semibold">Sélectionnez une conversation</h2>
							)}
						</div>

						{/* Messages Area */}
						<div className="flex-1 overflow-y-auto mb-4 px-4">
							{isLoadingMessages ? (
								<div className="flex items-center justify-center h-full">
									<p>Chargement des messages...</p>
								</div>
							) : messages?.length > 0 ? (
								messages.map((message) => (
									<Message
										key={message._id}
										message={message}
										isOwn={message.sender._id === authUser?._id}
										onReact={handleReactToMessage}
									/>
								))
							) : (
								<div className="flex items-center justify-center h-full text-gray-500">
									{selectedUser
										? "Aucun message. Commencez la conversation !"
										: "Sélectionnez une conversation pour commencer"}
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>

						{/* Message Input */}
						{selectedUser && (
							<MessageInput
								onSend={handleSendMessage}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChatPage;

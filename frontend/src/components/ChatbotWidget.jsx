import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, MessageCircle, Sparkles } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useQuery } from "@tanstack/react-query";

const getHistoryKey = (userId) => userId ? `chatbot_history_${userId}` : "chatbot_history_guest";

const ChatbotWidget = () => {
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const [isOpen, setIsOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const messagesEndRef = useRef(null);

	// Charger l'historique au montage ou quand l'utilisateur change
	useEffect(() => {
		const key = getHistoryKey(authUser?._id);
		const saved = localStorage.getItem(key);
		if (saved) {
			setMessages(JSON.parse(saved));
		} else {
			setMessages([]);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [authUser?._id]);

	// Sauvegarder l'historique à chaque changement
	useEffect(() => {
		const key = getHistoryKey(authUser?._id);
		localStorage.setItem(key, JSON.stringify(messages));
	}, [messages, authUser]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const openChat = () => {
		setIsOpen(true);
		setIsClosing(false);
		if (messages.length === 0) {
			setMessages([
				{
					id: "initial",
					text: `Bonjour ${authUser?.name?.split(" ")[1] || ""} ! Je suis l'assistant virtuel EMSI. Comment puis-je vous aider ?`,
					sender: "bot",
				},
			]);
		}
	};

	const closeChat = () => {
		setIsClosing(true);
		setTimeout(() => {
			setIsOpen(false);
			setIsClosing(false);
		}, 350);
	};

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!input.trim()) return;

		const userMessage = { id: Date.now(), text: input, sender: "user" };
		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		try {
			const res = await axiosInstance.post("/chatbot/query", {
				prompt: input,
				messages: messages.slice(-5),
			});
			const botMessage = {
				id: Date.now() + 1,
				text: res.data.response,
				sender: "bot",
			};
			setMessages((prev) => [...prev, botMessage]);
		} catch (error) {
			const errorMessage = {
				id: Date.now() + 1,
				text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
				sender: "bot",
			};
			setMessages((prev) => [...prev, errorMessage]);
			console.error("Erreur avec l'API du chatbot:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='fixed bottom-6 right-6 z-[9999]'>
			{/* Chat bubble icon - Design amélioré */}
			{!isOpen && (
				<div className="relative group">
					{/* Effet de pulsation */}
					<div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-ping opacity-20"></div>
					
					<button
						onClick={openChat}
						className='relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white p-5 rounded-full shadow-2xl hover:shadow-emerald-500/25 hover:scale-110 transition-all duration-300 group-hover:rotate-12 border-2 border-white/20 backdrop-blur-sm'
						aria-label='Ouvrir le chatbot'
					>
						<MessageCircle size={28} className="drop-shadow-lg" />
						
						{/* Badge de notification */}
						<div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
							<Sparkles size={12} className="text-white animate-pulse" />
						</div>
					</button>
					
					{/* Tooltip */}
					<div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
						Besoin d'aide ?
						<div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
					</div>
				</div>
			)}

			{/* Chat window - Design complètement repensé */}
			{isOpen && (
				<div className={`relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-96 h-[32rem] flex flex-col overflow-hidden ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'}`} 
					 style={{
						 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
					 }}>
					
					{/* Fond dégradé animé */}
					<div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20 opacity-80"></div>
					<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10"></div>
					
					{/* Header redesigné */}
					<div className='relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-5 flex justify-between items-center shadow-lg border-b border-white/10'>
						<div className='flex items-center gap-3'>
							<div className='relative bg-white/20 rounded-full p-2 backdrop-blur-sm border border-white/30'>
								<Bot size={24} className="text-white drop-shadow-lg" />
								<div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
							</div>
							<div>
								<h3 className='font-bold text-xl tracking-wide drop-shadow-lg'>Assistant EMSI</h3>
								<p className='text-white/80 text-xs'>En ligne • Réponse rapide</p>
							</div>
						</div>
						<button 
							onClick={closeChat} 
							className='hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:rotate-90'
						>
							<X size={22} />
						</button>
					</div>

					{/* Messages area avec design amélioré */}
					<div className='relative flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-white/50 to-white/30 backdrop-blur-sm'>
						{messages.map((msg, index) => (
							<div
								key={msg.id}
								className={`flex ${msg.sender === "bot" ? "items-start" : "items-end justify-end"} animate-fade-in`}
								style={{ animationDelay: `${index * 0.1}s` }}
							>
								{msg.sender === "bot" && (
									<div className="flex-shrink-0 mr-3 mt-1">
										<div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-full shadow-lg border-2 border-white/30">
											<Bot size={16} className="text-white" />
										</div>
									</div>
								)}
								
								<div
									className={`relative p-4 rounded-2xl max-w-[85%] text-sm shadow-lg backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02] ${
										msg.sender === "bot"
											? "bg-white/95 text-gray-800 border-emerald-100/60 shadow-emerald-100/30 rounded-tl-lg"
											: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white ml-auto shadow-emerald-500/25 border-white/20 rounded-tr-lg"
									}`}
								>
									{/* Indicateur de type de message */}
									<div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${
										msg.sender === "bot" 
											? "bg-gradient-to-b from-emerald-400 to-teal-500" 
											: "bg-gradient-to-b from-white/30 to-white/10"
									}`}></div>
									
									<div className="relative z-10">
										{msg.text}
									</div>
									
									{/* Effet de brillance subtil */}
									<div className={`absolute inset-0 rounded-2xl opacity-60 ${
										msg.sender === "bot"
											? "bg-gradient-to-br from-white/20 via-transparent to-transparent"
											: "bg-gradient-to-br from-white/10 via-transparent to-transparent"
									}`}></div>
								</div>

								{msg.sender === "user" && (
									<div className="flex-shrink-0 ml-3 mt-1">
										{authUser?.profilePicture ? (
											<img 
												src={authUser.profilePicture} 
												alt={`${authUser.name || 'Utilisateur'}`}
												className="w-8 h-8 rounded-full object-cover shadow-lg border-2 border-white/50 hover:scale-110 transition-transform duration-200"
												onError={(e) => {
													// Fallback si l'image ne charge pas
													e.target.style.display = 'none';
													e.target.nextSibling.style.display = 'flex';
												}}
											/>
										) : null}
										{/* Fallback avatar avec initiales */}
										<div 
											className={`w-8 h-8 rounded-full shadow-lg border-2 border-white/50 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform duration-200 ${authUser?.profilePicture ? 'hidden' : 'flex'}`}
										>
											{authUser?.name ? authUser.name.charAt(0).toUpperCase() : 'U'}
										</div>
									</div>
								)}
							</div>
						))}
						
						{/* Loading indicator amélioré */}
						{isLoading && (
							<div className='flex items-start'>
								<div className="flex-shrink-0 mr-3 mt-1">
									<div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-full shadow-lg border-2 border-white/30">
										<Bot size={16} className="text-white" />
									</div>
								</div>
								<div className='bg-white/95 backdrop-blur-sm p-4 rounded-2xl rounded-tl-lg shadow-lg border border-emerald-100/60 relative overflow-hidden'>
									{/* Indicateur de type de message */}
									<div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-500 rounded-l-2xl"></div>
									
									<div className='flex space-x-2 relative z-10'>
										<div className='w-2 h-2 bg-emerald-500 rounded-full animate-bounce'></div>
										<div className='w-2 h-2 bg-teal-500 rounded-full animate-bounce' style={{animationDelay: '0.1s'}}></div>
										<div className='w-2 h-2 bg-cyan-500 rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
									</div>
									
									{/* Effet de brillance subtil */}
									<div className="absolute inset-0 rounded-2xl opacity-60 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
								</div>
							</div>
						)}
						<div ref={messagesEndRef} />
					</div>

					{/* Input area redesigné */}
					<form onSubmit={handleSendMessage} className='relative p-4 bg-white/40 backdrop-blur-xl border-t border-white/20'>
						<div className='flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/50'>
							<input
								type='text'
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder='Posez votre question...'
								className='flex-1 px-4 py-3 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 font-medium'
								disabled={isLoading}
							/>
							<button
								type='submit'
								className='bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white p-3 rounded-xl shadow-lg hover:scale-110 hover:shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed border border-white/20'
								disabled={isLoading}
							>
								<Send size={20} className="drop-shadow-sm" />
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
};

export default ChatbotWidget;
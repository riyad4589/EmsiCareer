import { useState, useRef, useEffect } from "react";
import { X, Send, Bot } from "lucide-react";
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
					text: "Bonjour ! Je suis l'assistant virtuel EMSI. Comment puis-je vous aider aujourd'hui ?",
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
		<div className='fixed bottom-4 right-4 z-[9999]'>
			{/* Chat bubble icon */}
			{!isOpen && (
				<button
					onClick={openChat}
					className='bg-gradient-to-br from-green-600 to-green-400 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200'
					aria-label='Ouvrir le chatbot'
				>
					<Bot size={32} />
				</button>
			)}

			{/* Chat window */}
			{isOpen && (
				<div className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-green-100 w-80 h-96 flex flex-col ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'}`} style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
					<div className='bg-gradient-to-r from-green-600 to-green-400 text-white p-4 rounded-t-2xl flex justify-between items-center shadow-sm'>
						<div className='flex items-center gap-2'>
							<div className='bg-white/20 rounded-full p-1'><Bot size={22} className="text-green-700" /></div>
							<h3 className='font-bold text-lg tracking-wide drop-shadow'>Assistant EMSI</h3>
						</div>
						<button onClick={closeChat} className='hover:text-gray-200 transition-colors'>
							<X size={24} />
						</button>
					</div>
					<div className='flex-1 p-4 overflow-y-auto space-y-2 bg-gradient-to-b from-green-50/60 to-white'>
						{messages.map((msg) => (
							<div
								key={msg.id}
								className={`flex ${msg.sender === "bot" ? "items-start" : "items-end justify-end"}`}
							>
								{msg.sender === "bot" && (
									<div className="flex-shrink-0 mr-2 mt-1">
										<div className="bg-green-100 p-1 rounded-full">
											<Bot size={18} className="text-green-500" />
										</div>
									</div>
								)}
								<div
									className={`p-3 rounded-xl max-w-[80%] text-sm shadow-sm ${
										msg.sender === "bot"
											? "bg-white text-gray-800 border border-green-100"
											: "bg-green-500 text-white ml-auto border border-green-200"
									}`}
								>
									{msg.text}
								</div>
							</div>
						))}
						{isLoading && (
							<div className='self-start p-3'>
								<div className='dot-pulse'></div>
							</div>
						)}
						<div ref={messagesEndRef} />
					</div>
					<form onSubmit={handleSendMessage} className='p-4 border-t bg-white/80 rounded-b-2xl'>
						<div className='flex items-center gap-2'>
							<input
								type='text'
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder='Posez votre question...'
								className='flex-1 p-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/90 shadow-sm'
								disabled={isLoading}
							/>
							<button
								type='submit'
								className='bg-gradient-to-br from-green-500 to-green-400 text-white p-2 rounded-lg shadow hover:scale-105 hover:shadow-lg transition-all duration-150 disabled:bg-green-200 disabled:scale-100'
								disabled={isLoading}
							>
								<Send size={20} />
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
};

// Les animations CSS sont déjà présentes dans index.css

export default ChatbotWidget; 
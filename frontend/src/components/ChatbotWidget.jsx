import { useState, useRef, useEffect } from "react";
import { X, Send, Bot } from "lucide-react";
import { axiosInstance } from "../lib/axios";

const ChatbotWidget = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const toggleChat = () => {
		setIsOpen(!isOpen);
		if (!isOpen) {
			setMessages([
				{
					id: "initial",
					text: "Bonjour ! Je suis l'assistant virtuel EMSI. Comment puis-je vous aider aujourd'hui ?",
					sender: "bot",
				},
			]);
		}
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
				messages: messages.slice(-5), // Envoyer l'historique récent
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
					onClick={toggleChat}
					className='bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110'
					aria-label='Ouvrir le chatbot'
				>
					<Bot size={32} />
				</button>
			)}

			{/* Chat window */}
			{isOpen && (
				<div className='bg-white rounded-lg shadow-2xl w-80 h-96 flex flex-col animate-fade-in-up'>
					<div className='bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center'>
						<h3 className='font-bold text-lg'>Assistant EMSI</h3>
						<button onClick={toggleChat} className='hover:text-gray-200'>
							<X size={24} />
						</button>
					</div>
					<div className='flex-1 p-4 overflow-y-auto'>
						{messages.map((msg) => (
							<div
								key={msg.id}
								className={`my-2 p-3 rounded-lg max-w-[85%] ${
									msg.sender === "bot"
										? "bg-gray-200 text-gray-800 self-start text-left"
										: "bg-blue-500 text-white self-end ml-auto text-right"
								}`}
							>
								{msg.text}
							</div>
						))}
						{isLoading && (
							<div className='self-start p-3'>
								<div className='dot-pulse'></div>
							</div>
						)}
						<div ref={messagesEndRef} />
					</div>
					<form onSubmit={handleSendMessage} className='p-4 border-t'>
						<div className='flex items-center'>
							<input
								type='text'
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder='Posez votre question...'
								className='flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
								disabled={isLoading}
							/>
							<button
								type='submit'
								className='bg-blue-600 text-white p-3 rounded-r-lg hover:bg-blue-700 disabled:bg-blue-400'
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

export default ChatbotWidget; 
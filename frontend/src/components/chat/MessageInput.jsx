import { useState } from "react";
import { IoSend, IoAttach, IoHappy } from "react-icons/io5";

const MessageInput = ({ onSend }) => {
	const [message, setMessage] = useState("");
	const [isFocused, setIsFocused] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Message avant envoi:", message);
		console.log("Message trim:", message.trim());
		console.log("Longueur du message:", message.trim().length);
		
		if (message.trim().length > 0) {
			onSend({ content: message.trim() });
			setMessage("");
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	return (
		<div className="border-t bg-white px-4 py-3">
			<form onSubmit={handleSubmit} className="flex items-end gap-3">
				{/* Boutons d'actions supplémentaires */}
				<div className="flex gap-2 mb-2">
					<button
						type="button"
						className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
						title="Joindre un fichier"
					>
						<IoAttach size={20} />
					</button>
					<button
						type="button"
						className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
						title="Ajouter un emoji"
					>
						<IoHappy size={20} />
					</button>
				</div>

				{/* Zone de saisie */}
				<div className={`flex-1 relative rounded-2xl border-2 transition-all duration-200 ${
					isFocused 
						? "border-green-400 shadow-sm bg-white" 
						: "border-gray-200 hover:border-gray-300 bg-gray-50"
				}`}>
					<textarea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyPress={handleKeyPress}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						placeholder="Écrivez votre message..."
						rows="1"
						className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none placeholder-gray-400 leading-relaxed max-h-32"
						style={{ 
							minHeight: '48px',
							scrollbarWidth: 'thin',
							scrollbarColor: '#e5e7eb transparent'
						}}
					/>
					
					{/* Indicateur de caractères (optionnel) */}
					{message.length > 200 && (
						<div className="absolute bottom-1 right-2 text-xs text-gray-400">
							{message.length}/500
						</div>
					)}
				</div>

				{/* Bouton d'envoi */}
				<button
					type="submit"
					disabled={message.trim().length === 0}
					className={`p-3 rounded-full transition-all duration-200 transform ${
						message.trim().length > 0
							? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
							: "bg-gray-200 text-gray-400 cursor-not-allowed"
					}`}
					title="Envoyer le message"
				>
					<IoSend size={20} className={message.trim().length > 0 ? "translate-x-0.5" : ""} />
				</button>
			</form>

			{/* Indicateur de frappe (optionnel) */}
			<div className="mt-2 h-4 flex items-center">
				<div className="flex items-center gap-1 text-xs text-gray-500 opacity-0">
					<div className="flex gap-1">
						<div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
						<div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
						<div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
					</div>
					<span className="ml-2">John est en train d'écrire...</span>
				</div>
			</div>
		</div>
	);
};

export default MessageInput;
import { useState } from "react";
import { IoSend } from "react-icons/io5";

const MessageInput = ({ onSend }) => {
	const [message, setMessage] = useState("");

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

	return (
		<form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t">
			<input
				type="text"
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				placeholder="Écrivez votre message..."
				className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
			/>
			<button
				type="submit"
				disabled={message.trim().length === 0}
				className="p-2 text-green-500 hover:text-green-600 disabled:opacity-50"
			>
				<IoSend size={24} />
			</button>
		</form>
	);
};

export default MessageInput; 
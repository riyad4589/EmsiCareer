import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Message = ({ message, isOwn }) => {
	return (
		<div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-6 group`}>
			<div className={`flex flex-col max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
				{!isOwn && (
					<div className="flex items-center gap-3 mb-2 ml-1">
						<img
							src={message.sender.profilePicture || "/avatar.png"}
							alt={message.sender.name}
							className="w-7 h-7 rounded-full object-cover ring-2 ring-gray-200 shadow-sm"
						/>
						<span className="text-sm font-medium text-gray-700">{message.sender.name}</span>
					</div>
				)}
				
				<div className="relative">
					{/* Bulle de message */}
					<div
						className={`relative rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 group-hover:shadow-md ${
							isOwn
								? "bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-md"
								: "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
						}`}
					>
						<div className="break-words leading-relaxed">
							{message.content}
						</div>
						
						{/* Timestamp intégré */}
						<div className={`text-xs mt-2 ${
							isOwn 
								? "text-green-100 opacity-90" 
								: "text-gray-500"
						}`}>
							{format(new Date(message.createdAt), "HH:mm", { locale: fr })}
						</div>

						{/* Queue de la bulle */}
						<div className={`absolute top-2 w-0 h-0 ${
							isOwn
								? "right-0 translate-x-full border-l-8 border-l-green-500 border-t-8 border-t-transparent border-b-8 border-b-transparent"
								: "left-0 -translate-x-full border-r-8 border-r-white border-t-8 border-t-transparent border-b-8 border-b-transparent"
						}`}></div>
					</div>

					{/* État de lecture (pour les messages envoyés) */}
					{isOwn && (
						<div className="flex justify-end mt-1 mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
							<div className="flex items-center gap-1">
								<div className="w-1 h-1 bg-green-400 rounded-full"></div>
								<div className="w-1 h-1 bg-green-400 rounded-full"></div>
								<span className="text-xs text-green-600 ml-1">Envoyé</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Message;
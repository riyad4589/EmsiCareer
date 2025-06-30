import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Message = ({ message, isOwn }) => {
	return (
		<div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
			<div className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
				{!isOwn && (
					<div className="flex items-center gap-2 mb-1">
						<img
							src={message.sender.profilePicture || "/avatar.png"}
							alt={message.sender.name}
							className="w-6 h-6 rounded-full"
						/>
						<span className="text-sm font-medium">{message.sender.name}</span>
					</div>
				)}
				<div
					className={`rounded-lg p-3 ${
						isOwn
							? "bg-success text-white rounded-br-none"
							: "bg-gray-100 text-gray-900 rounded-bl-none"
					}`}
				>
					{message.content}
					<div className="text-xs mt-1 opacity-70">
						{format(new Date(message.createdAt), "HH:mm", { locale: fr })}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Message; 
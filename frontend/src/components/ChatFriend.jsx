import { Link } from "react-router-dom";

const ChatFriend = ({ user, isSelected }) => {
	return (
		<Link
			to={`/messages/${user._id}`}
			className={`group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
				isSelected
					? "bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 shadow-sm"
					: "hover:bg-gray-50 hover:shadow-sm hover:scale-[1.02]"
			}`}
		>
			{/* Avatar avec indicateur en ligne */}
			<div className="relative">
				<img
					src={user.profilePicture || "/avatar.png"}
					alt={user.name}
					className={`w-14 h-14 rounded-full object-cover ring-2 transition-all duration-300 ${
						isSelected 
							? "ring-green-200 shadow-md" 
							: "ring-gray-200 group-hover:ring-gray-300"
					}`}
				/>
				{/* Indicateur en ligne (optionnel) */}
				<div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
			</div>

			{/* Contenu */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between mb-1">
					<h3 className={`font-semibold truncate transition-colors ${
						isSelected ? "text-green-800" : "text-gray-900 group-hover:text-gray-800"
					}`}>
						{user.name}
					</h3>
					{user.unreadCount > 0 && (
						<div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-2 shadow-sm animate-pulse">
							{user.unreadCount > 99 ? '99+' : user.unreadCount}
						</div>
					)}
				</div>
				<p className={`text-sm truncate transition-colors ${
					isSelected ? "text-green-600" : "text-gray-500 group-hover:text-gray-600"
				}`}>
					{user.headline || "Aucune description"}
				</p>
			</div>

			{/* Indicateur de sélection */}
			{isSelected && (
				<div className="absolute right-2 top-1/2 transform -translate-y-1/2">
					<div className="w-2 h-2 bg-green-500 rounded-full"></div>
				</div>
			)}
		</Link>
	);
};

export default ChatFriend;
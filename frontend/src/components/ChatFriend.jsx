import { Link } from "react-router-dom";

const ChatFriend = ({ user, isSelected }) => {
	return (
		<Link
			to={`/messages/${user._id}`}
			className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
				isSelected
					? "bg-success/10 hover:bg-success/20"
					: "hover:bg-gray-100"
			}`}
		>
			<img
				src={user.profilePicture || "/avatar.png"}
				alt={user.name}
				className="w-12 h-12 rounded-full object-cover"
			/>
			<div className="flex-1 min-w-0">
				<h3 className="font-semibold truncate">{user.name}</h3>
				<p className="text-sm text-gray-500 truncate">{user.headline}</p>
			</div>
			{user.unreadCount > 0 && (
				<div className="bg-success text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
					{user.unreadCount}
				</div>
			)}
		</Link>
	);
};

export default ChatFriend; 
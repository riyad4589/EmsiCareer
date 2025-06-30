import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Bell, Check, Trash2, Loader } from "lucide-react";
import { toast } from "react-hot-toast";

const NotificationsDropdown = () => {
	const [isOpen, setIsOpen] = useState(false);
	const queryClient = useQueryClient();

	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			const response = await axiosInstance.get("/notifications");
			return response.data.data;
		},
	});

	const { data: unreadCount } = useQuery({
		queryKey: ["unreadCount"],
		queryFn: async () => {
			const response = await axiosInstance.get("/notifications/unread-count");
			return response.data.count;
		},
	});

	const markAllAsReadMutation = useMutation({
		mutationFn: async () => {
			const response = await axiosInstance.post("/notifications/mark-all-as-read");
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["notifications", "unreadCount"]);
			toast.success("Toutes les notifications ont été marquées comme lues");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Erreur lors du marquage des notifications");
		},
	});

	const deleteAllMutation = useMutation({
		mutationFn: async () => {
			const response = await axiosInstance.delete("/notifications");
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["notifications", "unreadCount"]);
			toast.success("Toutes les notifications ont été supprimées");
			setIsOpen(false);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Erreur lors de la suppression des notifications");
		},
	});

	const handleMarkAllAsRead = () => {
		if (window.confirm("Marquer toutes les notifications comme lues ?")) {
			markAllAsReadMutation.mutate();
		}
	};

	const handleDeleteAll = () => {
		if (window.confirm("Êtes-vous sûr de vouloir supprimer toutes les notifications ?")) {
			deleteAllMutation.mutate();
		}
	};

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
			>
				<Bell size={20} />
				{unreadCount > 0 && (
					<span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
						{unreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
					<div className="p-4 border-b">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-semibold">Notifications</h3>
							<div className="flex gap-2">
								<button
									onClick={handleMarkAllAsRead}
									disabled={markAllAsReadMutation.isPending || !notifications?.length}
									className="p-2 text-green-600 hover:text-green-500 disabled:opacity-50"
									title="Tout marquer comme lu"
								>
									{markAllAsReadMutation.isPending ? (
										<Loader size={16} className="animate-spin" />
									) : (
										<Check size={16} />
									)}
								</button>
								<button
									onClick={handleDeleteAll}
									disabled={deleteAllMutation.isPending || !notifications?.length}
									className="p-2 text-red-600 hover:text-red-500 disabled:opacity-50"
									title="Supprimer toutes les notifications"
								>
									{deleteAllMutation.isPending ? (
										<Loader size={16} className="animate-spin" />
									) : (
										<Trash2 size={16} />
									)}
								</button>
							</div>
						</div>
					</div>

					<div className="max-h-96 overflow-y-auto">
						{isLoading ? (
							<div className="flex justify-center items-center p-4">
								<Loader size={20} className="animate-spin" />
							</div>
						) : !notifications?.length ? (
							<div className="p-4 text-center text-gray-500">
								Aucune notification
							</div>
						) : (
							<div className="divide-y">
								{notifications.map((notification) => (
									<div
										key={notification._id}
										className={`p-4 hover:bg-gray-50 ${
											!notification.read ? "bg-green-50" : ""
										}`}
									>
										<div className="flex items-start space-x-3">
											<img
												src={notification.sender.profilePicture || "/default-avatar.png"}
												alt={notification.sender.name}
												className="w-10 h-10 rounded-full"
											/>
											<div className="flex-1">
												<p className="text-sm">{notification.message}</p>
												<p className="text-xs text-gray-500 mt-1">
													{notification.timeAgo}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default NotificationsDropdown; 
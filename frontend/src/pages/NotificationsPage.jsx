import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { Check, Trash2, Loader } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const NotificationsPage = () => {
	const queryClient = useQueryClient();

	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			const response = await axiosInstance.get("/notifications");
			return response.data.data;
		},
	});

	const markAsReadMutation = useMutation({
		mutationFn: (notificationId) => axiosInstance.post(`/notifications/${notificationId}/mark-as-read`),
		onSuccess: () => {
			queryClient.invalidateQueries(["notifications"]);
			queryClient.invalidateQueries(["unreadNotifications"]);
		},
	});

	const markAllAsReadMutation = useMutation({
		mutationFn: () => axiosInstance.post("/notifications/mark-all-as-read"),
		onSuccess: () => {
			queryClient.invalidateQueries(["notifications"]);
			queryClient.invalidateQueries(["unreadNotifications"]);
			toast.success("Toutes les notifications ont été marquées comme lues");
		},
	});

	const deleteNotificationMutation = useMutation({
		mutationFn: (notificationId) => axiosInstance.delete(`/notifications/${notificationId}`),
		onSuccess: () => {
			queryClient.invalidateQueries(["notifications"]);
			queryClient.invalidateQueries(["unreadNotifications"]);
			toast.success("Notification supprimée");
		},
	});

	const deleteAllNotificationsMutation = useMutation({
		mutationFn: () => axiosInstance.delete("/notifications"),
		onSuccess: () => {
			queryClient.invalidateQueries(["notifications"]);
			queryClient.invalidateQueries(["unreadNotifications"]);
			toast.success("Toutes les notifications ont été supprimées");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Erreur lors de la suppression des notifications");
		},
	});

	const handleDeleteAll = () => {
		if (window.confirm("Êtes-vous sûr de vouloir supprimer toutes les notifications ?")) {
			deleteAllNotificationsMutation.mutate();
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader className="animate-spin" />
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Notifications</h1>
				{notifications?.length > 0 && (
					<div className="flex gap-4">
						<button
							onClick={() => markAllAsReadMutation.mutate()}
							disabled={markAllAsReadMutation.isPending}
							className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
						>
							{markAllAsReadMutation.isPending ? (
								<Loader size={16} className="animate-spin" />
							) : (
								<Check size={16} />
							)}
							Tout marquer comme lu
						</button>
						<button
							onClick={handleDeleteAll}
							disabled={deleteAllNotificationsMutation.isPending}
							className="text-sm text-red-600 hover:text-red-700 flex items-center gap-2"
						>
							{deleteAllNotificationsMutation.isPending ? (
								<Loader size={16} className="animate-spin" />
							) : (
								<Trash2 size={16} />
							)}
							Tout supprimer
						</button>
					</div>
				)}
			</div>

			<div className="space-y-4">
				{!notifications || notifications?.length === 0 ? (
					<p className="text-center text-gray-500">Aucune notification</p>
				) : (
					notifications.map((notification) => (
						<div
							key={notification._id}
							className={`p-4 rounded-lg border ${
								notification.read ? "bg-white" : "bg-blue-50"
							}`}
						>
							<div className="flex justify-between items-start">
								<div className="flex-1">
									<p className="text-gray-800">{notification.message}</p>
									<p className="text-sm text-gray-500 mt-1">
										{formatDistanceToNow(new Date(notification.createdAt), {
											addSuffix: true,
											locale: fr,
										})}
									</p>
								</div>
								<div className="flex gap-2">
									{!notification.read && (
										<button
											onClick={() => markAsReadMutation.mutate(notification._id)}
											disabled={markAsReadMutation.isPending}
											className="p-2 text-green-600 hover:text-green-700"
										>
											<Check size={20} />
										</button>
									)}
									<button
										onClick={() => deleteNotificationMutation.mutate(notification._id)}
										disabled={deleteNotificationMutation.isPending}
										className="p-2 text-red-600 hover:text-red-700"
									>
										<Trash2 size={20} />
									</button>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default NotificationsPage;

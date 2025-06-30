import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { Camera, Clock, MapPin, UserCheck, UserPlus, X, Loader } from "lucide-react";
import { invalidateConnectionQueries } from "../utils/queryUtils";

const ProfileHeader = ({ userData, onSave, isOwnProfile }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editedData, setEditedData] = useState({});
	const queryClient = useQueryClient();

	const { data: authUser } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			const response = await axiosInstance.get("/auth/me");
			return response.data;
		}
	});

	const { data: connectionStatus, refetch: refetchConnectionStatus } = useQuery({
		queryKey: ["connectionStatus", userData._id],
		queryFn: () => axiosInstance.get(`/connections/status/${userData._id}`),
		enabled: !isOwnProfile,
	});

	const isConnected = connectionStatus?.data?.status === "accepted";

	const { mutate: sendConnectionRequest, isPending: isSendingRequest } = useMutation({
		mutationFn: (userId) => axiosInstance.post(`/connections/request/${userId}`),
		onSuccess: () => {
			toast.success("Demande de connexion envoyée");
			refetchConnectionStatus();
			queryClient.invalidateQueries(["connectionRequests"]);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Une erreur est survenue");
		},
	});

	const { mutate: acceptRequest, isPending: isAccepting } = useMutation({
		mutationFn: (requestId) => axiosInstance.post(`/connections/accept/${requestId}`),
		onSuccess: () => {
			toast.success("Demande de connexion acceptée");
			refetchConnectionStatus();
			queryClient.invalidateQueries(["connectionRequests"]);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Une erreur est survenue");
		},
	});

	const { mutate: rejectRequest, isPending: isRejecting } = useMutation({
		mutationFn: (requestId) => axiosInstance.post(`/connections/reject/${requestId}`),
		onSuccess: () => {
			toast.success("Demande de connexion refusée");
			refetchConnectionStatus();
			queryClient.invalidateQueries(["connectionRequests"]);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Une erreur est survenue");
		},
	});

	const { mutate: removeConnection, isPending: isRemoving } = useMutation({
		mutationFn: (userId) => axiosInstance.delete(`/connections/${userId}`),
		onSuccess: () => {
			toast.success("Connexion supprimée");
			refetchConnectionStatus();
			invalidateConnectionQueries(queryClient);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Une erreur est survenue");
		},
	});

	const getConnectionStatus = useMemo(() => {
		if (isConnected) return "connected";
		if (!isConnected) return "not_connected";
		return connectionStatus?.data?.status;
	}, [isConnected, connectionStatus]);

	const renderConnectionButton = () => {
		const baseClass = "text-white py-2 px-4 rounded-full transition duration-300 flex items-center justify-center";
		switch (getConnectionStatus) {
			case "connected":
				return (
					<div className='flex gap-2 justify-center'>
						<div className={`${baseClass} bg-green-500 hover:bg-green-600`}>
							<UserCheck size={20} className='mr-2' />
							Connecté
						</div>
						<button
							className={`${baseClass} bg-red-500 hover:bg-red-600 text-sm`}
							onClick={() => removeConnection(userData._id)}
							disabled={isRemoving}
						>
							{isRemoving ? (
								<Loader size={20} className="animate-spin mr-2" />
							) : (
								<X size={20} className='mr-2' />
							)}
							Supprimer
						</button>
					</div>
				);

			case "pending":
				return (
					<button className={`${baseClass} bg-yellow-500 hover:bg-yellow-600`}>
						<Clock size={20} className='mr-2' />
						En attente
					</button>
				);

			case "received":
				return (
					<div className='flex gap-2 justify-center'>
						<button
							onClick={() => acceptRequest(connectionStatus.data.requestId)}
							className={`${baseClass} bg-green-500 hover:bg-green-600`}
							disabled={isAccepting}
						>
							{isAccepting ? (
								<Loader size={20} className="animate-spin mr-2" />
							) : (
								"Accepter"
							)}
						</button>
						<button
							onClick={() => rejectRequest(connectionStatus.data.requestId)}
							className={`${baseClass} bg-red-500 hover:bg-red-600`}
							disabled={isRejecting}
						>
							{isRejecting ? (
								<Loader size={20} className="animate-spin mr-2" />
							) : (
								"Refuser"
							)}
						</button>
					</div>
				);
			default:
				return (
					<button
						onClick={() => sendConnectionRequest(userData._id)}
						className='bg-success hover:bg-success-dark text-white py-2 px-4 rounded-full transition duration-300 flex items-center justify-center'
						disabled={isSendingRequest}
					>
						{isSendingRequest ? (
							<Loader size={20} className="animate-spin mr-2" />
						) : (
							<UserPlus size={20} className='mr-2' />
						)}
						Se connecter
					</button>
				);
		}
	};

	const handleImageChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) { // 5MB limit
				toast.error("L'image ne doit pas dépasser 5MB");
				return;
			}
			const reader = new FileReader();
			reader.onloadend = () => {
				setEditedData((prev) => ({ ...prev, [event.target.name]: reader.result }));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSave = () => {
		onSave(editedData);
		setIsEditing(false);
	};

	return (
		<div className='bg-secondary shadow rounded-lg mb-6'>
			<div
				className='relative h-48 rounded-t-lg bg-cover bg-center'
				style={{
					backgroundImage: `url('${editedData.babanniere || userData.babanniere || "/banner.png"}')`,
				}}
			>
				{isEditing && (
					<label className='absolute top-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer hover:bg-gray-100 transition-colors duration-200'>
						<Camera size={20} />
						<input
							type='file'
							className='hidden'
							name='babanniere'
							onChange={handleImageChange}
							accept='image/*'
						/>
					</label>
				)}
			</div>

			<div className='p-4'>
				<div className='relative -mt-20 mb-4'>
					<img
						className='w-32 h-32 rounded-full mx-auto object-cover border-4 border-secondary'
						src={editedData.profilePicture || userData.profilePicture || "/avatar.png"}
						alt={userData.name}
					/>

					{isEditing && (
						<label className='absolute bottom-0 right-1/2 transform translate-x-16 bg-white p-2 rounded-full shadow cursor-pointer hover:bg-gray-100 transition-colors duration-200'>
							<Camera size={20} />
							<input
								type='file'
								className='hidden'
								name='profilePicture'
								onChange={handleImageChange}
								accept='image/*'
							/>
						</label>
					)}
				</div>

				<div className='text-center mb-4'>
					{isEditing ? (
						<input
							type='text'
							value={editedData.name ?? userData.name}
							onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
							className='text-2xl font-bold mb-2 text-center w-full bg-base-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-success'
						/>
					) : (
						<h1 className='text-2xl font-bold mb-2'>{userData.name}</h1>
					)}

					{isEditing ? (
						<input
							type='text'
							value={editedData.headline ?? userData.headline}
							onChange={(e) => setEditedData({ ...editedData, headline: e.target.value })}
							className='text-info text-center w-full bg-base-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-success'
						/>
					) : (
						<p className='text-info'>{userData.headline}</p>
					)}

					<div className='flex justify-center items-center mt-2'>
						<MapPin size={16} className='text-info mr-1' />
						{isEditing ? (
							<input
								type='text'
								value={editedData.location ?? userData.location}
								onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
								className='text-info text-center bg-base-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-success'
							/>
						) : (
							<span className='text-info'>{userData.location}</span>
						)}
					</div>
				</div>

				{isOwnProfile ? (
					isEditing ? (
						<button
							className='w-full bg-success text-white py-2 px-4 rounded-full hover:bg-success-dark transition duration-300'
							onClick={handleSave}
						>
							Enregistrer
						</button>
					) : (
						<button
							onClick={() => setIsEditing(true)}
							className='w-full bg-success text-white py-2 px-4 rounded-full hover:bg-success-dark transition duration-300'
						>
							Modifier le profil
						</button>
					)
				) : (
					renderConnectionButton()
				)}
			</div>
		</div>
	);
};

export default ProfileHeader;

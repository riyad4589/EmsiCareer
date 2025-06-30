import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Spinner } from "../components/ui/spinner";
import { useAuth } from "../contexts/AuthContext";
import PostCreation from "../components/PostCreation";
import PostList from "../components/PostList";
import RecommendedUsers from "../components/RecommendedUsers";
import { MapPin } from "lucide-react";

const HomePage = () => {
	const { user } = useAuth();

	const {
		data: posts,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			const response = await axiosInstance.get("/posts/only");
			return response.data;
		},
		enabled: !!user,
	});

	// ✅ Requête pour récupérer le profil du lauréat
	const {
		data: profile,
		isLoading: isProfileLoading,
	} = useQuery({
		queryKey: ["laureatProfile"],
		queryFn: async () => {
			const response = await axiosInstance.get("/users/profile");
			return response.data;
		},
		enabled: !!user,
	});

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-gray-600">Veuillez vous connecter pour voir votre fil d'actualité</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen text-center">
				<p className="text-red-600 font-semibold text-lg">Erreur lors du chargement des posts</p>
				<p className="text-gray-500 mt-2">{error.response?.data?.message || error.message}</p>
			</div>
		);
	}

	if (isLoading || isProfileLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
			{profile && (
				<div className="flex items-center gap-4 p-4 rounded-lg bg-white shadow-sm border border-gray-100 mb-6">
					<div className="flex-shrink-0">
						<img
							src={profile.profilePicture || "/avatar-default.png"}
							alt={profile.name}
							className="w-14 h-14 rounded-full object-cover border-2 border-green-600"
						/>
					</div>
					<div>
						<p className="text-sm text-gray-500">Bienvenue 👋</p>
						<p className="font-semibold text-gray-800 text-lg">
							<span className="text-green-700">{profile.name}</span>
						</p>
						<p className="text-xs text-gray-400">{profile.emailEdu}</p>
					</div>
				</div>
			)}




			{/* Zone de contenu */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-6">
					<PostCreation />
					<PostList posts={posts} />
				</div>
				<div>
					<RecommendedUsers />
				</div>
			</div>
		</div>
	);
};

export default HomePage;

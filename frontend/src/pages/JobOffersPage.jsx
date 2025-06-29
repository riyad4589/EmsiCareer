import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Building2, MapPin, Calendar } from "lucide-react";

const JobOffersPage = () => {
	const { data: jobOffers, isLoading, error } = useQuery({
		queryKey: ["jobOffers"],
		queryFn: async () => {
			try {
				const response = await axiosInstance.get("/posts");
				// Vérifier si response.data est un tableau
				if (Array.isArray(response.data)) {
					return response.data.filter(post => post.author?.role === "recruteur");
				}
				return [];
			} catch (error) {
				console.error("Erreur lors de la récupération des offres:", error);
				return [];
			}
		},
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-red-500">{error.message}</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-2xl font-bold mb-6">Offres d'emploi</h1>
				<div className="space-y-6">
					{jobOffers && jobOffers.length > 0 ? (
						jobOffers.map((offer) => (
							<div key={offer._id} className="bg-white rounded-lg shadow-md p-6">
								<div className="flex items-start space-x-4">
									<img
										src={offer.author?.profilePicture || "https://via.placeholder.com/40"}
										alt={offer.author?.name || "Entreprise"}
										className="w-12 h-12 rounded-full object-cover"
									/>
									<div className="flex-1">
										<div className="flex items-center justify-between">
											<h2 className="text-xl font-semibold">{offer.author?.companyName || "Entreprise"}</h2>
											<span className="text-sm text-gray-500">
												{formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true, locale: fr })}
											</span>
										</div>
										<div className="mt-2 space-y-2">
											<div className="flex items-center text-gray-600">
												<Building2 size={16} className="mr-2" />
												<span>{offer.author?.industry || "Non spécifié"}</span>
											</div>
											<div className="flex items-center text-gray-600">
												<MapPin size={16} className="mr-2" />
												<span>{offer.author?.location || "Non spécifié"}</span>
											</div>
										</div>
										<div className="mt-4">
											<p className="text-gray-700 whitespace-pre-wrap">{offer.content}</p>
										</div>
										<div className="mt-4 flex items-center justify-between">
											<div className="flex items-center text-gray-500">
												<Calendar size={16} className="mr-2" />
												<span>Publié le {new Date(offer.createdAt).toLocaleDateString()}</span>
											</div>
											<button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
												Postuler
											</button>
										</div>
									</div>
								</div>
							</div>
						))
					) : (
						<div className="bg-white rounded-lg shadow-md p-8 text-center">
							<h2 className="text-xl font-semibold text-gray-700 mb-2">Aucune offre pour le moment</h2>
							<p className="text-gray-500">Revenez plus tard pour découvrir de nouvelles opportunités</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default JobOffersPage; 
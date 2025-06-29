import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { Spinner } from "../components/ui/spinner";
import { useAuth } from "../contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Edit2, Save, X, Loader, Camera, MapPin, FileText, User, Mail, Briefcase, Building2 } from "lucide-react";

const ProfilePage = () => {
	const { username } = useParams();
	const { user: currentUser } = useAuth();
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);
	const [editedProfile, setEditedProfile] = useState({});
	const [previewImages, setPreviewImages] = useState({
		profilePicture: null,
		coverPicture: null,
	});
	const [isEditingCompany, setIsEditingCompany] = useState(false);
	const [editedCompany, setEditedCompany] = useState({});
	const [previewCompanyLogo, setPreviewCompanyLogo] = useState(null);
	const navigate = useNavigate();

	// Requête pour obtenir l'utilisateur authentifié
	const { data: authUser } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			const response = await axiosInstance.get("/auth/me");
			return response.data;
		},
		staleTime: 1000 * 60 * 5,
		cacheTime: 1000 * 60 * 30,
		retry: 3,
		refetchOnWindowFocus: true,
	});

	const { data: profile, isLoading: profileLoading } = useQuery({
		queryKey: ["profile", username || "me"],
		queryFn: async () => {
			if (username) {
				const response = await axiosInstance.get(`/users/${username}`);
				return response.data;
			} else if (authUser) {
				return authUser;
			} else {
				return null;
			}
		},
		enabled: username !== undefined || !!authUser,
		staleTime: 1000 * 60 * 5,
		cacheTime: 1000 * 60 * 30,
		retry: 3,
		refetchOnWindowFocus: true,
	});

	const updateProfileMutation = useMutation({
		mutationFn: async (updatedData) => {
			try {
				console.log("Données envoyées au backend:", updatedData);
				const formData = new FormData();
				
				// Ajouter les champs textuels
				Object.keys(updatedData).forEach(key => {
					if (key !== 'profilePicture' && key !== 'bannerImg' && key !== 'cv') {
						if (typeof updatedData[key] === 'object') {
							formData.append(key, JSON.stringify(updatedData[key]));
						} else {
							formData.append(key, updatedData[key]);
						}
					}
				});

				// Ajouter les images si elles ont été modifiées
				if (updatedData.profilePicture instanceof File) {
					formData.append('profilePicture', updatedData.profilePicture);
				}
				if (updatedData.bannerImg instanceof File) {
					formData.append('bannerImg', updatedData.bannerImg);
				}
				if (updatedData.cv instanceof File) {
					formData.append('cv', updatedData.cv);
				}

				console.log("FormData avant envoi:", Object.fromEntries(formData.entries()));

				const response = await axiosInstance.put("/users/profile", formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				});
				console.log("Réponse du backend:", response.data);
				return response.data;
			} catch (error) {
				console.error("Erreur lors de la mise à jour du profil:", error);
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["profile", username]);
			queryClient.invalidateQueries(["authUser"]);
			toast.success("Profil mis à jour avec succès");
			setIsEditing(false);
			setPreviewImages({ profilePicture: null, bannerImg: null });
		},
		onError: (error) => {
			console.error("Erreur de mutation:", error);
			toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du profil");
		},
	});

	const handleEdit = () => {
		setEditedProfile({
			name: profile.name,
			about: profile.about,
			experience: profile.experience || [],
			education: profile.education || [],
			cv: profile.cv || null
		});
		setIsEditing(true);
	};

	const handleSave = () => {
		console.log("Données avant sauvegarde:", editedProfile);
		updateProfileMutation.mutate(editedProfile);
	};

	const handleCancel = () => {
		setIsEditing(false);
		setEditedProfile({});
		setPreviewImages({ profilePicture: null, coverPicture: null });
	};

	const handleInputChange = (field, value) => {
		console.log(`Modification du champ ${field}:`, value);
		setEditedProfile((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleImageChange = async (event, type) => {
		const file = event.target.files[0];
		if (file) {
			// Vérifier la taille du fichier (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Le fichier ne doit pas dépasser 5MB");
				return;
			}

			// Vérifier le type de fichier
			if (type === 'cv') {
				if (file.type !== 'application/pdf') {
					toast.error("Le fichier doit être un PDF");
					return;
				}
			} else if (!file.type.startsWith('image/')) {
				toast.error("Le fichier doit être une image");
				return;
			}

			// Créer une URL de prévisualisation pour les images
			if (type !== 'cv') {
				const previewUrl = URL.createObjectURL(file);
				setPreviewImages(prev => ({
					...prev,
					[type]: previewUrl
				}));
			}

			// Mettre à jour le profil édité
			setEditedProfile(prev => ({
				...prev,
				[type]: file
			}));
		}
	};

	// Fonction pour nettoyer les ressources
	useEffect(() => {
		return () => {
			// Nettoyer les URLs de prévisualisation des images
			if (previewImages.profilePicture) {
				URL.revokeObjectURL(previewImages.profilePicture);
			}
			if (previewImages.coverPicture) {
				URL.revokeObjectURL(previewImages.coverPicture);
			}
		};
	}, [previewImages]);

	if (profileLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Spinner />
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-gray-600">Profil non trouvé</p>
			</div>
		);
	}

	const isOwnProfile = currentUser?.username === username;

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			{/* En-tête du profil */}
			<div className="bg-white rounded-lg shadow mb-6">
				<div className="relative h-48 bg-gray-200 rounded-t-lg">
					<img
						src={previewImages.coverPicture || profile.coverPicture || "/banner.png"}
						alt="Photo de couverture"
						className="w-full h-full object-cover rounded-t-lg"
						loading="lazy"
					/>
					{isEditing && (
						<label className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow cursor-pointer hover:bg-gray-100 transition-colors duration-200">
							<Camera className="w-5 h-5 text-gray-600" />
							<input
								type="file"
								className="hidden"
								accept="image/*"
								onChange={(e) => handleImageChange(e, 'coverPicture')}
							/>
						</label>
					)}
				</div>
				<div className="p-6">
					<div className="flex items-start">
						<div className="relative">
							<img
								src={previewImages.profilePicture || profile.profilePicture || "/default-avatar.png"}
								alt={profile.name}
								className="w-24 h-24 rounded-full border-4 border-white -mt-12 object-cover"
								loading="lazy"
							/>
							{isEditing && (
								<label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow cursor-pointer hover:bg-gray-100 transition-colors duration-200">
									<Camera className="w-5 h-5 text-gray-600" />
									<input
										type="file"
										className="hidden"
										accept="image/*"
										onChange={(e) => handleImageChange(e, 'profilePicture')}
									/>
								</label>
							)}
						</div>
						<div className="ml-6 flex-1">
							{isEditing ? (
								<input
									type="text"
									value={editedProfile.name}
									onChange={(e) => handleInputChange("name", e.target.value)}
									className="text-2xl font-bold bg-gray-50 rounded px-2 py-1 w-full mb-2"
								/>
							) : (
								<h1 className="text-2xl font-bold">{profile.name}</h1>
							)}

							{/* Affichage du rôle déplacé ici */}
							<div className='flex justify-start items-center mt-1'>
								<span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
									{profile.role === "admin" ? "Administrateur" :
									 profile.role === "recruteur" ? "Recruteur" :
									 "Utilisateur"}
								</span>
							</div>

							{/* Date de création du compte */}
							<p className='text-sm text-gray-500 mt-1'>
								Membre depuis{" "}
								{formatDistanceToNow(new Date(profile.createdAt), {
									addSuffix: true,
									locale: fr,
								})}
							</p>
						</div>
						{isOwnProfile && (
							<div className="flex gap-2">
								{isEditing ? (
									<>
										<button
											onClick={handleSave}
											disabled={updateProfileMutation.isLoading}
											className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
										>
											{updateProfileMutation.isLoading ? (
												<Loader className="w-4 h-4 animate-spin" />
											) : (
												<Save className="w-4 h-4" />
											)}
											Enregistrer
										</button>
										<button
											onClick={handleCancel}
											className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
										>
											<X className="w-4 h-4" />
											Annuler
										</button>
									</>
								) : (
									<button
										onClick={handleEdit}
										className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
									>
										<Edit2 className="w-4 h-4" />
										Modifier
									</button>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Carte d'informations du recruteur */}
			{profile.role === "recruteur" && (
				<div className="bg-white rounded-lg shadow mb-6 p-6">
					<div className="flex items-center mb-4">
					<h2 className="text-2xl font-bold text-black flex items-center gap-2">
  						<User className="w-6 h-6 font-bold" /> Informations du recruteur
					</h2>

					</div>
					<div className="divide-y divide-gray-100">
						<div className="flex items-center py-2 gap-3">
							<User className="w-5 h-5 text-gray-400" />
							<span className="font-semibold text-gray-700 w-32">Nom :</span>
							<span className="text-gray-900">{profile.companyName}</span>
						</div>
						<div className="flex items-center py-2 gap-3">
							<Mail className="w-5 h-5 text-gray-400" />
							<span className="font-semibold text-gray-700 w-32">Email :</span>
							<span className="text-gray-900">{profile.emailEdu}</span>
						</div>
						<div className="flex items-center py-2 gap-3">
							<Building2 className="w-5 h-5 text-gray-400" />
							<span className="font-semibold text-gray-700 w-32">Entreprise :</span>
							<span className="text-gray-900">{profile.companyName}</span>
						</div>
						<div className="flex items-center py-2 gap-3">
							<Briefcase className="w-5 h-5 text-gray-400" />
							<span className="font-semibold text-gray-700 w-32">Secteur :</span>
							<span className="text-gray-900">{profile.industry}</span>
						</div>
						<div className="flex items-center py-2 gap-3">
							<MapPin className="w-5 h-5 text-gray-400" />
							<span className="font-semibold text-gray-700 w-32">Localisation :</span>
							<span className="text-gray-900">{profile.location}</span>
						</div>
						<div className="flex items-start py-2 gap-3">
							<FileText className="w-5 h-5 text-gray-400 mt-1" />
							<span className="font-semibold text-gray-700 w-32">Description :</span>
							<span className="text-gray-900">{profile.description || profile.companyDescription}</span>
						</div>
					</div> 
				</div>
			)}
			</div>
	);
};

export default ProfilePage;

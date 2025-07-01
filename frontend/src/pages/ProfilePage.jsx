import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { Spinner } from "../components/ui/spinner";
import { useAuth } from "../contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { 
	Edit2, 
	Save, 
	X, 
	Loader, 
	Camera, 
	MapPin, 
	FileText, 
	User, 
	Mail, 
	Briefcase, 
	Building2, 
	Plus,
	Trash2,
	GraduationCap,
	Star,
	Phone,
	Globe,
	Linkedin,
	Github,
	Calendar,
	BookOpen
} from "lucide-react";

const ProfilePage = () => {
	const { username } = useParams();
	const { user: currentUser } = useAuth();
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);
	const [editedProfile, setEditedProfile] = useState({});
	const [previewImages, setPreviewImages] = useState({
		profilePicture: null,
		banniere: null,
	});
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
				console.log("=== DÉBUT MISE À JOUR PROFIL ===");
				console.log("Données envoyées au backend:", updatedData);
				const formData = new FormData();
				
				// Ajouter les champs textuels
				Object.keys(updatedData).forEach(key => {
					if (key !== 'profilePicture' && key !== 'banniere' && key !== 'cv') {
						if (typeof updatedData[key] === 'object') {
							const jsonValue = JSON.stringify(updatedData[key]);
							console.log(`Ajout champ ${key} (JSON):`, jsonValue);
							formData.append(key, jsonValue);
						} else {
							console.log(`Ajout champ ${key}:`, updatedData[key]);
							formData.append(key, updatedData[key]);
						}
					}
				});

				// Ajouter les images si elles ont été modifiées
				if (updatedData.profilePicture instanceof File) {
					console.log("Ajout profilePicture:", updatedData.profilePicture.name);
					formData.append('profilePicture', updatedData.profilePicture);
				}
				if (updatedData.banniere instanceof File) {
					console.log("Ajout banniere:", updatedData.banniere.name);
					formData.append('banniere', updatedData.banniere);
				}
				if (updatedData.cv instanceof File) {
					console.log("Ajout cv:", updatedData.cv.name);
					formData.append('cv', updatedData.cv);
				} else if (updatedData.cv === "DELETE_CV") {
					console.log("Suppression du CV demandée");
					formData.append('cv', "DELETE_CV");
				}

				console.log("FormData avant envoi:", Object.fromEntries(formData.entries()));
				console.log("URL de la requête:", "/users/profile");

				const response = await axiosInstance.put("/users/profile", formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				});
				console.log("Réponse du backend:", response.data);
				console.log("=== FIN MISE À JOUR PROFIL ===");
				return response.data;
			} catch (error) {
				console.error("=== ERREUR MISE À JOUR PROFIL ===");
				console.error("Erreur complète:", error);
				console.error("Message d'erreur:", error.message);
				console.error("Réponse d'erreur:", error.response?.data);
				console.error("Status d'erreur:", error.response?.status);
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["profile", username]);
			queryClient.invalidateQueries(["authUser"]);
			toast.success("Profil mis à jour avec succès");
			setIsEditing(false);
			setPreviewImages({ profilePicture: null, banniere: null });
		},
		onError: (error) => {
			console.error("Erreur de mutation:", error);
			toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du profil");
		},
	});

	const handleEdit = () => {
		console.log("=== DÉBUT MODE ÉDITION ===");
		console.log("Profil actuel:", profile);
		
		const editData = {
			name: profile.name || "",
			about: profile.about || "",
			email: profile.email || profile.emailEdu || "",
			phone: profile.phone || "",
			location: profile.location || "",
			website: profile.website || "",
			linkedin: profile.linkedin || "",
			github: profile.github || "",
			experience: profile.experience || [],
			education: profile.education || [],
			skills: profile.skills || [],
			cv: profile.cv || null,
			// Informations spécifiques au recruteur
			companyName: profile.companyName || "",
			industry: profile.industry || "",
			companyDescription: profile.companyDescription || profile.description || "",
			emailEdu: profile.emailEdu || ""
		};
		
		console.log("Données d'édition préparées:", editData);
		setEditedProfile(editData);
		setIsEditing(true);
		console.log("=== FIN MODE ÉDITION ===");
	};

	const handleSave = () => {
		console.log("Données avant sauvegarde:", editedProfile);
		updateProfileMutation.mutate(editedProfile);
	};

	const handleCancel = () => {
		setIsEditing(false);
		setEditedProfile({});
		setPreviewImages({ profilePicture: null, banniere: null });
	};

	const handleInputChange = (field, value) => {
		console.log(`Modification du champ ${field}:`, value);
		setEditedProfile((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleArrayChange = (field, index, value) => {
		setEditedProfile((prev) => {
			const newArray = [...(prev[field] || [])];
			newArray[index] = { ...newArray[index], ...value };
			return {
				...prev,
				[field]: newArray,
			};
		});
	};

	const addArrayItem = (field) => {
		setEditedProfile((prev) => ({
			...prev,
			[field]: [...(prev[field] || []), {}],
		}));
	};

	const removeArrayItem = (field, index) => {
		setEditedProfile((prev) => ({
			...prev,
			[field]: prev[field].filter((_, i) => i !== index),
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

	const handleRemoveCV = () => {
		setEditedProfile(prev => ({
			...prev,
			cv: "DELETE_CV" // Marqueur spécial pour indiquer la suppression
		}));
		toast.success("CV supprimé. N'oubliez pas de sauvegarder pour confirmer la suppression.");
	};

	// Fonction pour nettoyer les ressources
	useEffect(() => {
		return () => {
			// Nettoyer les URLs de prévisualisation des images
			if (previewImages.profilePicture) {
				URL.revokeObjectURL(previewImages.profilePicture);
			}
			if (previewImages.banniere) {
				URL.revokeObjectURL(previewImages.banniere);
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
	const displayProfile = isEditing ? editedProfile : profile;

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			{/* En-tête du profil */}
			<div className="bg-white rounded-lg shadow mb-6">
				<div className="relative h-48 bg-gray-200 rounded-t-lg">
					<img
						src={previewImages.banniere || profile.banniere || "/banner.png"}
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
								onChange={(e) => handleImageChange(e, 'banniere')}
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
									value={editedProfile.name || ""}
									onChange={(e) => handleInputChange("name", e.target.value)}
									className="text-2xl font-bold bg-gray-50 rounded px-2 py-1 w-full mb-2"
									placeholder="Nom complet"
								/>
							) : (
								<h1 className="text-2xl font-bold">{profile.name}</h1>
							)}

							{/* Affichage du rôle */}
							<div className='flex justify-start items-center mt-1'>
								<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
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
										className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
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

			{/* Section À propos */}
			<div className="bg-white rounded-lg shadow mb-6 p-6">
				<h2 className="text-xl font-bold mb-4 flex items-center gap-2">
					<User className="w-5 h-5" />
					À propos
				</h2>
				{isEditing ? (
					<textarea
						value={editedProfile.about || ""}
						onChange={(e) => handleInputChange("about", e.target.value)}
						className="w-full p-3 border border-gray-300 rounded-md resize-none"
						rows="4"
						placeholder="Parlez-nous de vous..."
					/>
				) : (
					<p className="text-gray-700">{profile.about || "Aucune description disponible"}</p>
				)}
			</div>

			{/* Section Informations de contact */}
			<div className="bg-white rounded-lg shadow mb-6 p-6">
				<h2 className="text-xl font-bold mb-4 flex items-center gap-2">
					<Mail className="w-5 h-5" />
					Informations de contact
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="flex items-center gap-3">
						<Mail className="w-5 h-5 text-gray-400" />
						<span className="font-semibold text-gray-700 w-20">Email :</span>
						{isEditing ? (
							<input
								type="email"
								value={editedProfile.email || ""}
								onChange={(e) => handleInputChange("email", e.target.value)}
								className="flex-1 p-2 border border-gray-300 rounded-md"
								placeholder="votre@email.com"
							/>
						) : (
							<span className="text-gray-900">{profile.email}</span>
						)}
					</div>
					<div className="flex items-center gap-3">
						<Phone className="w-5 h-5 text-gray-400" />
						<span className="font-semibold text-gray-700 w-20">Téléphone :</span>
						{isEditing ? (
							<input
								type="tel"
								value={editedProfile.phone || ""}
								onChange={(e) => handleInputChange("phone", e.target.value)}
								className="flex-1 p-2 border border-gray-300 rounded-md"
								placeholder="+33 6 12 34 56 78"
							/>
						) : (
							<span className="text-gray-900">{profile.phone || "Non renseigné"}</span>
						)}
					</div>
					<div className="flex items-center gap-3">
						<MapPin className="w-5 h-5 text-gray-400" />
						<span className="font-semibold text-gray-700 w-20">Localisation :</span>
						{isEditing ? (
							<input
								type="text"
								value={editedProfile.location || ""}
								onChange={(e) => handleInputChange("location", e.target.value)}
								className="flex-1 p-2 border border-gray-300 rounded-md"
								placeholder="Paris, France"
							/>
						) : (
							<span className="text-gray-900">{profile.location || "Non renseigné"}</span>
						)}
					</div>
					<div className="flex items-center gap-3">
						<Globe className="w-5 h-5 text-gray-400" />
						<span className="font-semibold text-gray-700 w-20">Site web :</span>
						{isEditing ? (
							<input
								type="url"
								value={editedProfile.website || ""}
								onChange={(e) => handleInputChange("website", e.target.value)}
								className="flex-1 p-2 border border-gray-300 rounded-md"
								placeholder="https://monsite.com"
							/>
						) : (
							<span className="text-gray-900">{profile.website || "Non renseigné"}</span>
						)}
					</div>
					<div className="flex items-center gap-3">
						<Linkedin className="w-5 h-5 text-gray-400" />
						<span className="font-semibold text-gray-700 w-20">LinkedIn :</span>
						{isEditing ? (
							<input
								type="url"
								value={editedProfile.linkedin || ""}
								onChange={(e) => handleInputChange("linkedin", e.target.value)}
								className="flex-1 p-2 border border-gray-300 rounded-md"
								placeholder="https://linkedin.com/in/votre-profil"
							/>
						) : (
							<span className="text-gray-900">{profile.linkedin || "Non renseigné"}</span>
						)}
					</div>
					<div className="flex items-center gap-3">
						<Github className="w-5 h-5 text-gray-400" />
						<span className="font-semibold text-gray-700 w-20">GitHub :</span>
						{isEditing ? (
							<input
								type="url"
								value={editedProfile.github || ""}
								onChange={(e) => handleInputChange("github", e.target.value)}
								className="flex-1 p-2 border border-gray-300 rounded-md"
								placeholder="https://github.com/votre-username"
							/>
						) : (
							<span className="text-gray-900">{profile.github || "Non renseigné"}</span>
						)}
					</div>
				</div>
			</div>

			{/* Section Expérience */}
			<div className="bg-white rounded-lg shadow mb-6 p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-bold flex items-center gap-2">
						<Briefcase className="w-5 h-5" />
						Expérience professionnelle
					</h2>
					{isEditing && (
						<button
							onClick={() => addArrayItem('experience')}
							className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
						>
							<Plus className="w-4 h-4" />
							Ajouter
						</button>
					)}
				</div>
				{displayProfile.experience && displayProfile.experience.length > 0 ? (
					<div className="space-y-4">
						{displayProfile.experience.map((exp, index) => (
							<div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
								{isEditing ? (
									<div className="space-y-2">
										<div className="flex gap-2">
											<input
												type="text"
												value={exp.title || ""}
												onChange={(e) => handleArrayChange('experience', index, { title: e.target.value })}
												className="flex-1 p-2 border border-gray-300 rounded-md"
												placeholder="Titre du poste"
											/>
											<button
												onClick={() => removeArrayItem('experience', index)}
												className="px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
										<input
											type="text"
											value={exp.company || ""}
											onChange={(e) => handleArrayChange('experience', index, { company: e.target.value })}
											className="w-full p-2 border border-gray-300 rounded-md"
											placeholder="Nom de l'entreprise"
										/>
										<div className="grid grid-cols-2 gap-2">
											<input
												type="text"
												value={exp.startDate || ""}
												onChange={(e) => handleArrayChange('experience', index, { startDate: e.target.value })}
												className="p-2 border border-gray-300 rounded-md"
												placeholder="Date de début (MM/YYYY)"
											/>
											<input
												type="text"
												value={exp.endDate || ""}
												onChange={(e) => handleArrayChange('experience', index, { endDate: e.target.value })}
												className="p-2 border border-gray-300 rounded-md"
												placeholder="Date de fin (MM/YYYY) ou Actuel"
											/>
										</div>
										<textarea
											value={exp.description || ""}
											onChange={(e) => handleArrayChange('experience', index, { description: e.target.value })}
											className="w-full p-2 border border-gray-300 rounded-md resize-none"
											rows="3"
											placeholder="Description des responsabilités"
										/>
									</div>
								) : (
									<div>
										<h3 className="font-semibold text-lg">{exp.title}</h3>
										<p className="text-gray-600">{exp.company}</p>
										<p className="text-sm text-gray-500">
											{exp.startDate} - {exp.endDate || "Actuel"}
										</p>
										<p className="text-gray-700 mt-2">{exp.description}</p>
									</div>
								)}
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-500">Aucune expérience renseignée</p>
				)}
			</div>

			{/* Section Éducation */}
			<div className="bg-white rounded-lg shadow mb-6 p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-bold flex items-center gap-2">
						<GraduationCap className="w-5 h-5" />
						Formation
					</h2>
					{isEditing && (
						<button
							onClick={() => addArrayItem('education')}
							className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
						>
							<Plus className="w-4 h-4" />
							Ajouter
						</button>
					)}
				</div>
				{displayProfile.education && displayProfile.education.length > 0 ? (
					<div className="space-y-4">
						{displayProfile.education.map((edu, index) => (
							<div key={index} className="border-l-4 border-green-500 pl-4 py-2">
								{isEditing ? (
									<div className="space-y-2">
										<div className="flex gap-2">
											<input
												type="text"
												value={edu.degree || ""}
												onChange={(e) => handleArrayChange('education', index, { degree: e.target.value })}
												className="flex-1 p-2 border border-gray-300 rounded-md"
												placeholder="Diplôme"
											/>
											<button
												onClick={() => removeArrayItem('education', index)}
												className="px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
										<input
											type="text"
											value={edu.school || ""}
											onChange={(e) => handleArrayChange('education', index, { school: e.target.value })}
											className="w-full p-2 border border-gray-300 rounded-md"
											placeholder="Établissement"
										/>
										<div className="grid grid-cols-2 gap-2">
											<input
												type="text"
												value={edu.startDate || ""}
												onChange={(e) => handleArrayChange('education', index, { startDate: e.target.value })}
												className="p-2 border border-gray-300 rounded-md"
												placeholder="Date de début (MM/YYYY)"
											/>
											<input
												type="text"
												value={edu.endDate || ""}
												onChange={(e) => handleArrayChange('education', index, { endDate: e.target.value })}
												className="p-2 border border-gray-300 rounded-md"
												placeholder="Date de fin (MM/YYYY)"
											/>
										</div>
										<textarea
											value={edu.description || ""}
											onChange={(e) => handleArrayChange('education', index, { description: e.target.value })}
											className="w-full p-2 border border-gray-300 rounded-md resize-none"
											rows="3"
											placeholder="Description de la formation"
										/>
									</div>
								) : (
									<div>
										<h3 className="font-semibold text-lg">{edu.degree}</h3>
										<p className="text-gray-600">{edu.school}</p>
										<p className="text-sm text-gray-500">
											{edu.startDate} - {edu.endDate}
										</p>
										<p className="text-gray-700 mt-2">{edu.description}</p>
									</div>
								)}
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-500">Aucune formation renseignée</p>
				)}
			</div>

			{/* Section Compétences */}
			<div className="bg-white rounded-lg shadow mb-6 p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-bold flex items-center gap-2">
						<Star className="w-5 h-5" />
						Compétences
					</h2>
					{isEditing && (
						<button
							onClick={() => addArrayItem('skills')}
							className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
						>
							<Plus className="w-4 h-4" />
							Ajouter
						</button>
					)}
				</div>
				{displayProfile.skills && displayProfile.skills.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{displayProfile.skills.map((skill, index) => (
							<div key={index} className="flex items-center gap-2">
								{isEditing ? (
									<>
										<input
											type="text"
											value={skill.name || ""}
											onChange={(e) => handleArrayChange('skills', index, { name: e.target.value })}
											className="p-2 border border-gray-300 rounded-md"
											placeholder="Nom de la compétence"
										/>
										<select
											value={skill.level || "débutant"}
											onChange={(e) => handleArrayChange('skills', index, { level: e.target.value })}
											className="p-2 border border-gray-300 rounded-md"
										>
											<option value="débutant">Débutant</option>
											<option value="intermédiaire">Intermédiaire</option>
											<option value="avancé">Avancé</option>
											<option value="expert">Expert</option>
										</select>
										<button
											onClick={() => removeArrayItem('skills', index)}
											className="px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</>
								) : (
									<span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
										{skill.name} ({skill.level})
									</span>
								)}
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-500">Aucune compétence renseignée</p>
				)}
			</div>

			{/* Section CV */}
			<div className="bg-white rounded-lg shadow mb-6 p-6">
				<h2 className="text-xl font-bold mb-4 flex items-center gap-2">
					<FileText className="w-5 h-5" />
					CV
				</h2>
				{isEditing ? (
					<div>
						<label className="block mb-2 text-sm font-medium text-gray-700">
							Télécharger un nouveau CV (PDF)
						</label>
						<input
							type="file"
							accept=".pdf"
							onChange={(e) => handleImageChange(e, 'cv')}
							className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
						/>
						{profile.cv && (
							<div className="mt-3 p-3 bg-gray-50 rounded-md">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-700">CV actuel :</p>
										<p className="text-sm text-gray-600 truncate">{profile.cv}</p>
									</div>
									<button
										onClick={handleRemoveCV}
										className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1 text-sm"
									>
										<Trash2 className="w-4 h-4" />
										Supprimer
									</button>
								</div>
							</div>
						)}
						{editedProfile.cv && editedProfile.cv instanceof File && (
							<div className="mt-3 p-3 bg-green-50 rounded-md">
								<p className="text-sm font-medium text-green-700">Nouveau CV sélectionné :</p>
								<p className="text-sm text-green-600">{editedProfile.cv.name}</p>
							</div>
						)}
					</div>
				) : (
					<div>
						{profile.cv ? (
							<div className="flex items-center gap-3">
								<a
									href={profile.cv}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
								>
									<FileText className="w-4 h-4" />
									Télécharger le CV
								</a>
								{isOwnProfile && (
									<button
										onClick={handleEdit}
										className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
									>
										<Edit2 className="w-4 h-4" />
										Modifier
									</button>
								)}
							</div>
						) : (
							<p className="text-gray-500">Aucun CV téléchargé</p>
						)}
					</div>
				)}
			</div>

			{/* Carte d'informations du recruteur */}
			{profile.role === "recruteur" && (
				<div className="bg-white rounded-lg shadow mb-6 p-6">
					<h2 className="text-2xl font-bold text-black flex items-center gap-2 mb-4">
						<Building2 className="w-6 h-6 font-bold" /> 
						Informations du recruteur
					</h2>
					<div className="divide-y divide-gray-100">
						<div className="flex items-center py-2 gap-3">
							<User className="w-5 h-5 text-gray-400" />
							<span className="font-semibold text-gray-700 w-32">Nom :</span>
							{isEditing ? (
								<input
									type="text"
									value={editedProfile.companyName || ""}
									onChange={(e) => handleInputChange("companyName", e.target.value)}
									className="flex-1 p-2 border border-gray-300 rounded-md"
									placeholder="Nom de l'entreprise"
								/>
							) : (
								<span className="text-gray-900">{profile.companyName}</span>
							)}
						</div>
						<div className="flex items-center py-2 gap-3">
							<Mail className="w-5 h-5 text-gray-400" />
							<span className="font-semibold text-gray-700 w-32">Email :</span>
							{isEditing ? (
								<input
									type="email"
									value={editedProfile.emailEdu || ""}
									onChange={(e) => handleInputChange("emailEdu", e.target.value)}
									className="flex-1 p-2 border border-gray-300 rounded-md"
									placeholder="email@entreprise.com"
								/>
							) : (
								<span className="text-gray-900">{profile.emailEdu}</span>
							)}
						</div>
						<div className="flex items-center py-2 gap-3">
							<Briefcase className="w-5 h-5 text-gray-400" />
							<span className="font-semibold text-gray-700 w-32">Secteur :</span>
							{isEditing ? (
								<input
									type="text"
									value={editedProfile.industry || ""}
									onChange={(e) => handleInputChange("industry", e.target.value)}
									className="flex-1 p-2 border border-gray-300 rounded-md"
									placeholder="Secteur d'activité"
								/>
							) : (
								<span className="text-gray-900">{profile.industry}</span>
							)}
						</div>
						<div className="flex items-center py-2 gap-3">
							<MapPin className="w-5 h-5 text-gray-400" />
							<span className="font-semibold text-gray-700 w-32">Localisation :</span>
							{isEditing ? (
								<input
									type="text"
									value={editedProfile.location || ""}
									onChange={(e) => handleInputChange("location", e.target.value)}
									className="flex-1 p-2 border border-gray-300 rounded-md"
									placeholder="Localisation de l'entreprise"
								/>
							) : (
								<span className="text-gray-900">{profile.location}</span>
							)}
						</div>
						<div className="flex items-start py-2 gap-3">
							<FileText className="w-5 h-5 text-gray-400 mt-1" />
							<span className="font-semibold text-gray-700 w-32">Description :</span>
							{isEditing ? (
								<textarea
									value={editedProfile.companyDescription || ""}
									onChange={(e) => handleInputChange("companyDescription", e.target.value)}
									className="flex-1 p-2 border border-gray-300 rounded-md resize-none"
									rows="3"
									placeholder="Description de l'entreprise"
								/>
							) : (
								<span className="text-gray-900">{profile.description || profile.companyDescription}</span>
							)}
						</div>
					</div> 
				</div>
			)}
		</div>
	);
};

export default ProfilePage;

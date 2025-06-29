import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { Image as ImageIcon, Loader, Briefcase } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const PostCreation = () => {
	const [content, setContent] = useState("");
	const [image, setImage] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [showJobForm, setShowJobForm] = useState(false);
	const [jobDetails, setJobDetails] = useState({
		titre: "",
		localisation: "",
		typeContrat: "CDI",
		competencesRequises: []
	});
	const [newCompetence, setNewCompetence] = useState("");
	const { user } = useAuth();
	const queryClient = useQueryClient();

	const createPostMutation = useMutation({
		mutationFn: async (formData) => {
			const response = await axiosInstance.post("/posts", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return response.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries(["posts"]);
			setContent("");
			setImage(null);
			setImagePreview(null);
			setShowJobForm(false);
			setJobDetails({
				titre: "",
				localisation: "",
				typeContrat: "CDI",
				competencesRequises: []
			});
			toast.success(data.message || "Publication créée avec succès");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Erreur lors de la création du post");
		},
	});

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleAddCompetence = () => {
		if (newCompetence.trim() && !jobDetails.competencesRequises.includes(newCompetence.trim())) {
			setJobDetails(prev => ({
				...prev,
				competencesRequises: [...prev.competencesRequises, newCompetence.trim()]
			}));
			setNewCompetence("");
		}
	};

	const handleRemoveCompetence = (index) => {
		setJobDetails(prev => ({
			...prev,
			competencesRequises: prev.competencesRequises.filter((_, i) => i !== index)
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!content.trim() && !image) {
			toast.error("Le contenu ou une image est requis");
			return;
		}

		if (user.role === "recruteur" && showJobForm && (!jobDetails.titre || !jobDetails.localisation)) {
			toast.error("Veuillez remplir tous les champs obligatoires pour l'offre d'emploi");
			return;
		}

		const formData = new FormData();
		formData.append("content", content);
		if (image) {
			formData.append("image", image);
		}
		if (user.role === "recruteur" && showJobForm) {
			formData.append("isJobPost", "true");
			formData.append("jobDetails", JSON.stringify(jobDetails));
		}

		createPostMutation.mutate(formData);
	};

	const isRecruteur = user?.role === "recruteur";

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<div className="flex items-center space-x-4 mb-4">
				<img
					src={user?.profilePicture || "/default-avatar.png"}
					alt={user?.name}
					className="w-12 h-12 rounded-full"
				/>
				<div>
					<h3 className="font-medium">{user?.name}</h3>
					<p className="text-sm text-gray-500">
						{isRecruteur ? "Créer une publication ou une offre d'emploi" : "Créer un post"}
					</p>
				</div>
			</div>

			{/* Bouton pour créer une offre d'emploi (recruteurs uniquement) */}
			{isRecruteur && (
				<div className="mb-4">
					<button
						type="button"
						onClick={() => setShowJobForm(!showJobForm)}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
							showJobForm 
								? "bg-blue-50 border-blue-200 text-blue-700" 
								: "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
						}`}
					>
						<Briefcase size={16} />
						{showJobForm ? "Créer un post normal" : "Créer une offre d'emploi"}
					</button>
				</div>
			)}

			{/* Formulaire d'offre d'emploi */}
			{showJobForm && (
				<div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<h4 className="font-semibold text-blue-800 mb-3">Détails de l'offre d'emploi</h4>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Titre du poste *
							</label>
							<input
								type="text"
								value={jobDetails.titre}
								onChange={(e) => setJobDetails(prev => ({ ...prev, titre: e.target.value }))}
								placeholder="Ex: Développeur Full Stack"
								className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Localisation *
							</label>
							<input
								type="text"
								value={jobDetails.localisation}
								onChange={(e) => setJobDetails(prev => ({ ...prev, localisation: e.target.value }))}
								placeholder="Ex: Paris, France"
								className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Type de contrat
							</label>
							<select
								value={jobDetails.typeContrat}
								onChange={(e) => setJobDetails(prev => ({ ...prev, typeContrat: e.target.value }))}
								className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="CDI">CDI</option>
								<option value="CDD">CDD</option>
								<option value="Stage">Stage</option>
								<option value="Freelance">Freelance</option>
								<option value="Alternance">Alternance</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Compétences requises
							</label>
							<div className="flex gap-2">
								<input
									type="text"
									value={newCompetence}
									onChange={(e) => setNewCompetence(e.target.value)}
									onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCompetence())}
									placeholder="Ajouter une compétence"
									className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
								<button
									type="button"
									onClick={handleAddCompetence}
									className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
								>
									+
								</button>
							</div>
							{jobDetails.competencesRequises.length > 0 && (
								<div className="flex flex-wrap gap-1 mt-2">
									{jobDetails.competencesRequises.map((comp, index) => (
										<span key={index} className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
											{comp}
											<button
												type="button"
												onClick={() => handleRemoveCompetence(index)}
												className="text-blue-600 hover:text-blue-800"
											>
												×
											</button>
										</span>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder={showJobForm ? "Décrivez le poste, les responsabilités, l'environnement de travail..." : "Quoi de neuf ?"}
					className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
					rows="3"
				/>
				{imagePreview && (
					<div className="relative mt-4">
						<img
							src={imagePreview}
							alt="Preview"
							className="w-full rounded-lg"
						/>
						<button
							type="button"
							onClick={() => {
								setImage(null);
								setImagePreview(null);
							}}
							className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
						>
							×
						</button>
					</div>
				)}
				<div className="flex items-center justify-between mt-4">
					<label className="cursor-pointer">
						<input
							type="file"
							accept="image/*"
							onChange={handleImageChange}
							className="hidden"
						/>
						<ImageIcon className="text-gray-500 hover:text-blue-500" />
					</label>
					<button
						type="submit"
						disabled={createPostMutation.isPending}
						className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{createPostMutation.isPending ? (
							<Loader className="animate-spin" />
						) : (
							showJobForm ? "Publier l'offre" : "Publier"
						)}
					</button>
				</div>
			</form>
		</div>
	);
};

export default PostCreation;

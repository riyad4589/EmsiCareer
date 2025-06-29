import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import { Edit, Trash2, Lock, Plus, Eye, EyeOff, Building2, Search } from "lucide-react";
import { useState, useMemo } from "react";

const RecruitersManagementPage = () => {
	const [editingRecruiter, setEditingRecruiter] = useState(null);
	const [selectedRecruiter, setSelectedRecruiter] = useState(null);
	const [isCreating, setIsCreating] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [passwordStrength, setPasswordStrength] = useState(0);
	const [companyFilter, setCompanyFilter] = useState("");
	const [industryFilter, setIndustryFilter] = useState("");
	const [editForm, setEditForm] = useState({
		name: "",
		emailEdu: "",
		emailPersonelle: "",
		status: "",
		companyName: "",
		industry: "",
		location: "",
		companySize: "",
		companyDescription: "",
	});
	const [createForm, setCreateForm] = useState({
		name: "",
		emailEdu: "",
		emailPersonelle: "",
		username: "",
		password: "",
		role: "recruteur",
		status: "active",
		companyName: "",
		industry: "",
		customIndustry: "",
		location: "",
		companyDescription: "",
	});
	const [passwordForm, setPasswordForm] = useState({
		password: "",
		confirmPassword: "",
	});
	const [passwordMatch, setPasswordMatch] = useState(true);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	const queryClient = useQueryClient();

	const { data: recruitersData, isLoading, error } = useQuery({
		queryKey: ["recruiters"],
		queryFn: async () => {
			try {
				const response = await axiosInstance.get("/admin/users");
				return response.data.filter(user => user.role === "recruteur");
			} catch (error) {
				console.error("Erreur lors de la récupération des recruteurs:", error);
				throw new Error(error.response?.data?.message || "Une erreur est survenue lors du chargement des recruteurs");
			}
		},
		staleTime: 1000 * 60 * 5,
		cacheTime: 1000 * 60 * 30,
		retry: 3,
		refetchOnWindowFocus: true,
	});

	const recruiters = recruitersData || [];

	const { mutate: updateRecruiter } = useMutation({
		mutationFn: (recruiterData) => {
			const { _id, ...updateData } = recruiterData;
			return axiosInstance.put(`/admin/users/${_id}`, updateData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["recruiters"]);
			toast.success("Recruteur mis à jour avec succès");
			setEditingRecruiter(null);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
		},
	});

	const { mutate: updatePassword } = useMutation({
		mutationFn: (data) => axiosInstance.put(`/admin/users/${data.userId}/password`, { password: data.password }),
		onSuccess: () => {
			toast.success("Mot de passe mis à jour avec succès");
			setSelectedRecruiter(null);
			setPasswordForm({ password: "", confirmPassword: "" });
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du mot de passe");
		},
	});

	const { mutate: deleteRecruiter } = useMutation({
		mutationFn: (userId) => axiosInstance.delete(`/admin/users/${userId}`),
		onSuccess: () => {
			queryClient.invalidateQueries(["recruiters"]);
			toast.success("Recruteur supprimé avec succès");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Erreur lors de la suppression");
		},
	});

	const { mutate: createRecruiter } = useMutation({
		mutationFn: (recruiterData) => axiosInstance.post("/admin/users", recruiterData),
		onSuccess: () => {
			queryClient.invalidateQueries(["recruiters"]);
			toast.success("Recruteur créé avec succès");
			setIsCreating(false);
			setCreateForm({
				name: "",
				emailEdu: "",
				emailPersonelle: "",
				username: "",
				password: "",
				role: "recruteur",
				status: "active",
				companyName: "",
				industry: "",
				customIndustry: "",
				location: "",
				companyDescription: "",
			});
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Erreur lors de la création");
		},
	});

	const calculatePasswordStrength = (password) => {
		let strength = 0;
		if (password.length >= 8) strength += 1;
		if (/[A-Z]/.test(password)) strength += 1;
		if (/[a-z]/.test(password)) strength += 1;
		if (/[0-9]/.test(password)) strength += 1;
		if (/[^A-Za-z0-9]/.test(password)) strength += 1;
		return strength;
	};

	const getPasswordStrengthColor = (strength) => {
		switch (strength) {
			case 0:
			case 1:
				return "bg-red-500";
			case 2:
			case 3:
				return "bg-yellow-500";
			case 4:
			case 5:
				return "bg-green-500";
			default:
				return "bg-gray-200";
		}
	};

	const getPasswordStrengthText = (strength) => {
		switch (strength) {
			case 0:
			case 1:
				return "Très faible";
			case 2:
			case 3:
				return "Moyen";
			case 4:
			case 5:
				return "Fort";
			default:
				return "";
		}
	};

	const handlePasswordChange = (e) => {
		const newPassword = e.target.value;
		setPasswordForm(prev => ({ ...prev, password: newPassword }));
		setPasswordStrength(calculatePasswordStrength(newPassword));
		setPasswordMatch(newPassword === passwordForm.confirmPassword);
	};

	const handleConfirmPasswordChange = (e) => {
		const newConfirmPassword = e.target.value;
		setPasswordForm(prev => ({ ...prev, confirmPassword: newConfirmPassword }));
		setPasswordMatch(newConfirmPassword === passwordForm.password);
	};

	const handlePasswordSubmit = (e) => {
		e.preventDefault();
		if (passwordForm.password !== passwordForm.confirmPassword) {
			toast.error("Les mots de passe ne correspondent pas");
			return;
		}
		if (passwordStrength < 3) {
			toast.error("Le mot de passe est trop faible. Veuillez utiliser un mot de passe plus fort.");
			return;
		}
		updatePassword({ userId: selectedRecruiter._id, password: passwordForm.password });
	};

	const handleEdit = (recruiter) => {
		setEditingRecruiter(recruiter._id);
		setEditForm({
			name: recruiter.name,
			emailEdu: recruiter.emailEdu,
			emailPersonelle: recruiter.emailPersonelle || "",
			username: recruiter.username,
			companyName: recruiter.companyName,
			industry: recruiter.industry,
			customIndustry: recruiter.industry === "autre" ? recruiter.customIndustry : "",
			location: recruiter.location,
			description: recruiter.description
		});
		setIsEditModalOpen(true);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		
		// Validation de l'email professionnel
		if (!editForm.emailEdu.endsWith("@emsi.ma")) {
			toast.error("L'email professionnel doit se terminer par @emsi.ma pour les recruteurs");
			return;
		}

		// Si le secteur est "autre", utiliser la valeur personnalisée
		const industry = editForm.industry === "autre" ? editForm.customIndustry : editForm.industry;

		updateRecruiter({ 
			_id: editingRecruiter, 
			...editForm,
			industry,
			role: "recruteur" 
		});
		setIsEditModalOpen(false);
	};

	const handleCreateSubmit = (e) => {
		e.preventDefault();
		
		// Validation de l'email professionnel
		if (createForm.emailEdu.includes(" ")) {
			toast.error("L'email professionnel ne doit pas contenir d'espaces");
			return;
		}
		if (!createForm.emailEdu.endsWith("@emsi.ma")) {
			toast.error("L'email professionnel doit se terminer par @emsi.ma pour les recruteurs");
			return;
		}

		// Validation des champs requis pour les recruteurs
		if (!createForm.companyName) {
			toast.error("Le nom de l'entreprise est requis");
			return;
		}
		if (!createForm.industry) {
			toast.error("Le secteur d'activité est requis");
			return;
		}
		if (!createForm.location) {
			toast.error("La localisation est requise");
			return;
		}

		// Préparation des données pour l'envoi
		const recruiterData = {
			...createForm,
			role: "recruteur",
			companyName: createForm.companyName,
			industry: createForm.industry,
			location: createForm.location,
			description: createForm.companyDescription
		};
		
		createRecruiter(recruiterData);
	};

	// Extraire les entreprises et secteurs uniques pour les filtres
	const uniqueCompanies = useMemo(() => {
		const companies = new Set(recruiters.map(r => r.companyName));
		return Array.from(companies).sort();
	}, [recruiters]);

	const uniqueIndustries = useMemo(() => {
		const industries = new Set(recruiters.map(r => r.industry));
		return Array.from(industries).sort();
	}, [recruiters]);

	// Filtrer les recruteurs en fonction des filtres sélectionnés
	const filteredRecruiters = useMemo(() => {
		return recruiters.filter(recruiter => {
			const matchesCompany = !companyFilter || recruiter.companyName.toLowerCase().includes(companyFilter.toLowerCase());
			const matchesIndustry = !industryFilter || recruiter.industry === industryFilter;
			return matchesCompany && matchesIndustry;
		});
	}, [recruiters, companyFilter, industryFilter]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
					<p className="mt-4 text-gray-600">Chargement des recruteurs...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<p className="text-red-500 text-lg">Une erreur est survenue lors du chargement des recruteurs</p>
					<p className="text-gray-600 mt-2">{error.message}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 pt-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-bold text-gray-900">Gestion des recruteurs</h1>
					<button
						onClick={() => setIsCreating(true)}
						className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						<Plus className="h-5 w-5 mr-2" />
						Ajouter un recruteur
					</button>
				</div>

				{/* Filtres */}
				<div className="bg-white p-4 rounded-lg shadow mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Filtre par entreprise */}
						<div>
							<label htmlFor="companyFilter" className="block text-sm font-medium text-gray-700 mb-1">
								Filtrer par entreprise
							</label>
							<div className="relative">
								<input
									type="text"
									id="companyFilter"
									value={companyFilter}
									onChange={(e) => setCompanyFilter(e.target.value)}
									placeholder="Rechercher une entreprise..."
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
								<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
							</div>
						</div>

						{/* Filtre par secteur d'activité */}
						<div>
							<label htmlFor="industryFilter" className="block text-sm font-medium text-gray-700 mb-1">
								Filtrer par secteur d'activité
							</label>
							<select
								id="industryFilter"
								value={industryFilter}
								onChange={(e) => setIndustryFilter(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="">Tous les secteurs</option>
								{uniqueIndustries.map((industry) => (
									<option key={industry} value={industry}>
										{industry === "autre" ? "Autre" : industry}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{/* Liste des recruteurs */}
				<div className="bg-white shadow rounded-lg overflow-hidden">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Nom
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Email Professionnelle
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Email Personnel
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Entreprise
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Statut
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredRecruiters.length > 0 ? (
								filteredRecruiters.map((recruiter) => (
									<tr key={recruiter._id}>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 h-10 w-10">
													<img
														className="h-10 w-10 rounded-full"
														src={recruiter.profilePicture || "/avatar.png"}
														alt={recruiter.name}
													/>
												</div>
												<div className="ml-4">
													<div className="text-sm font-medium text-gray-900">{recruiter.name}</div>
													<div className="text-sm text-gray-500">@{recruiter.username}</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">{recruiter.emailEdu}</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">{recruiter.emailPersonelle || "-"}</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">{recruiter.companyName || "-"}</div>
											<div className="text-sm text-gray-500">{recruiter.industry || "-"}</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
													recruiter.status === "active"
														? "bg-green-100 text-green-800"
														: recruiter.status === "pending"
														? "bg-yellow-100 text-yellow-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{recruiter.status === "active"
													? "Actif"
													: recruiter.status === "pending"
													? "En attente"
													: "Rejeté"}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
											<div className="flex items-center justify-center space-x-4">
												<button
													onClick={() => handleEdit(recruiter)}
													className="text-blue-600 hover:text-blue-900"
												>
													<Edit size={18} />
												</button>
												<button
													onClick={() => setSelectedRecruiter(recruiter)}
													className="text-green-600 hover:text-green-900"
												>
													<Lock size={18} />
												</button>
												<button
													onClick={() => {
														if (window.confirm("Êtes-vous sûr de vouloir supprimer ce recruteur ?")) {
															deleteRecruiter(recruiter._id);
														}
													}}
													className="text-red-600 hover:text-red-900"
												>
													<Trash2 size={18} />
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan="6" className="px-6 py-4 text-center text-gray-500">
										Aucun recruteur trouvé
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal de changement de mot de passe */}
			{selectedRecruiter && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
						<div className="p-6 border-b border-gray-200">
							<div className="flex justify-between items-center">
								<div>
									<h2 className="text-2xl font-bold text-gray-900">Changer le mot de passe</h2>
									<p className="mt-1 text-sm text-gray-500">Pour {selectedRecruiter.name}</p>
								</div>
								<button
									onClick={() => setSelectedRecruiter(null)}
									className="text-gray-400 hover:text-gray-500 focus:outline-none"
								>
									<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>
						<form onSubmit={handlePasswordSubmit} className="p-6">
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Nouveau mot de passe <span className="text-red-500">*</span>
									</label>
									<div className="relative">
										<input
											type={showPassword ? "text" : "password"}
											value={passwordForm.password}
											onChange={handlePasswordChange}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
											required
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
										>
											{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
										</button>
									</div>
									{passwordForm.password && (
										<div className="mt-2">
											<div className="flex space-x-1">
												{[...Array(5)].map((_, i) => (
													<div
														key={i}
														className={`h-1 w-full rounded-full ${
															i < passwordStrength ? getPasswordStrengthColor(passwordStrength) : "bg-gray-200"
														}`}
													/>
												))}
											</div>
											<p className={`text-sm mt-1 ${
												passwordStrength < 3 ? "text-red-500" : "text-green-500"
											}`}>
												{getPasswordStrengthText(passwordStrength)}
											</p>
										</div>
									)}
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Confirmer le mot de passe <span className="text-red-500">*</span>
									</label>
									<div className="relative">
										<input
											type={showConfirmPassword ? "text" : "password"}
											value={passwordForm.confirmPassword}
											onChange={handleConfirmPasswordChange}
											className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
												passwordForm.confirmPassword
													? passwordMatch
														? "border-green-300"
														: "border-red-300"
													: "border-gray-300"
											}`}
											required
										/>
										<button
											type="button"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
										>
											{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
										</button>
									</div>
									{passwordForm.confirmPassword && !passwordMatch && (
										<p className="mt-1 text-sm text-red-500">Les mots de passe ne correspondent pas</p>
									)}
								</div>
							</div>
							<div className="mt-8 flex justify-end space-x-3">
								<button
									type="button"
									onClick={() => setSelectedRecruiter(null)}
									className="px-6 py-2.5 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
								>
									Annuler
								</button>
								<button
									type="submit"
									className="px-6 py-2.5 bg-blue-600 text-sm font-medium text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
								>
									Enregistrer
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal de création de recruteur */}
			{isCreating && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-xl max-w-5xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
						<div className="sticky top-0 bg-white p-6 border-b border-gray-200 z-10">
							<div className="flex justify-between items-center">
								<div>
									<h2 className="text-2xl font-bold text-gray-900">Créer un nouveau recruteur</h2>
									<p className="mt-1 text-sm text-gray-500">Remplissez les informations du recruteur</p>
								</div>
								<button
									onClick={() => setIsCreating(false)}
									className="text-gray-400 hover:text-gray-500 focus:outline-none"
								>
									<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>
						<form onSubmit={handleCreateSubmit} className="p-6">
							<div className="space-y-8">
								{/* Informations personnelles */}
								<div>
									<h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Nom complet <span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													value={createForm.name}
													onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
													required
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Email Professionnelle <span className="text-red-500">*</span>
												</label>
												<input
													type="email"
													value={createForm.emailEdu}
													onChange={(e) => setCreateForm({ ...createForm, emailEdu: e.target.value })}
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
													required
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Email Personnel
												</label>
												<input
													type="email"
													value={createForm.emailPersonelle}
													onChange={(e) => setCreateForm({ ...createForm, emailPersonelle: e.target.value })}
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
												/>
											</div>
										</div>
										<div className="space-y-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Nom d'utilisateur <span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													value={createForm.username}
													onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
													required
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Mot de passe <span className="text-red-500">*</span>
												</label>
												<div className="relative">
													<input
														type={showPassword ? "text" : "password"}
														value={createForm.password}
														onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
														className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
														required
													/>
													<button
														type="button"
														onClick={() => setShowPassword(!showPassword)}
														className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
													>
														{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
													</button>
												</div>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Statut <span className="text-red-500">*</span>
												</label>
												<select
													value={createForm.status}
													onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
												>
													<option value="active">Actif</option>
													<option value="pending">En attente</option>
													<option value="rejected">Rejeté</option>
												</select>
											</div>
										</div>
									</div>
								</div>

								{/* Informations de l'entreprise */}
								<div>
									<h3 className="text-lg font-medium text-gray-900 mb-4">Informations de l'entreprise</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Nom de l'entreprise <span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													value={createForm.companyName}
													onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
													required
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Secteur d'activité <span className="text-red-500">*</span>
												</label>
												<select
													value={createForm.industry}
													onChange={(e) => setCreateForm({ ...createForm, industry: e.target.value })}
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
													required
												>
													<option value="">Sélectionnez un secteur</option>
													<option value="tech">Technologie</option>
													<option value="finance">Finance</option>
													<option value="healthcare">Santé</option>
													<option value="education">Éducation</option>
													<option value="retail">Commerce</option>
													<option value="manufacturing">Industrie</option>
													<option value="other">Autre</option>
												</select>
												{createForm.industry === "other" && (
													<div className="mt-2">
														<input
															type="text"
															value={createForm.customIndustry}
															onChange={(e) => setCreateForm({ ...createForm, customIndustry: e.target.value })}
															className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
															placeholder="Précisez le secteur d'activité"
															required
														/>
													</div>
												)}
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Localisation <span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													value={createForm.location}
													onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
													placeholder="Ville, Adresse"
													required
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Description de l'entreprise <span className="text-red-500">*</span>
												</label>
												<textarea
													value={createForm.companyDescription}
													onChange={(e) => setCreateForm({ ...createForm, companyDescription: e.target.value })}
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
													rows="3"
													placeholder="Décrivez brièvement votre entreprise..."
													required
												/>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="sticky bottom-0 bg-white border-t border-gray-200 mt-8 pt-6 flex justify-end space-x-3">
								<button
									type="button"
									onClick={() => setIsCreating(false)}
									className="px-6 py-2.5 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
								>
									Annuler
								</button>
								<button
									type="submit"
									className="px-6 py-2.5 bg-blue-600 text-sm font-medium text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
								>
									Créer
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal de modification */}
			{isEditModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
						<div className="sticky top-0 bg-white pb-4 border-b">
							<h2 className="text-2xl font-bold mb-4">Modifier le recruteur</h2>
						</div>
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Informations personnelles */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-700">Informations personnelles</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Nom complet
										</label>
										<input
											type="text"
											value={editForm.name}
											onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Nom d'utilisateur
										</label>
										<input
											type="text"
											value={editForm.username}
											onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Email professionnel
										</label>
										<input
											type="email"
											value={editForm.emailEdu}
											onChange={(e) => setEditForm({ ...editForm, emailEdu: e.target.value })}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
											placeholder="exemple@emsi.ma"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Email personnel
										</label>
										<input
											type="email"
											value={editForm.emailPersonelle}
											onChange={(e) => setEditForm({ ...editForm, emailPersonelle: e.target.value })}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
											placeholder="exemple@gmail.com"
										/>
									</div>
								</div>
							</div>

							{/* Informations de l'entreprise */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-700">Informations de l'entreprise</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Nom de l'entreprise
										</label>
										<input
											type="text"
											value={editForm.companyName}
											onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Secteur d'activité
										</label>
										<select
											value={editForm.industry}
											onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
											required
										>
											<option value="">Sélectionner un secteur</option>
											<option value="informatique">Informatique</option>
											<option value="finance">Finance</option>
											<option value="sante">Santé</option>
											<option value="education">Éducation</option>
											<option value="marketing">Marketing</option>
											<option value="consulting">Consulting</option>
											<option value="industrie">Industrie</option>
											<option value="telecommunications">Télécommunications</option>
											<option value="energie">Énergie</option>
											<option value="construction">Construction</option>
											<option value="transport">Transport</option>
											<option value="commerce">Commerce</option>
											<option value="media">Médias</option>
											<option value="autre">Autre</option>
										</select>
										{editForm.industry === "autre" && (
											<div className="mt-2">
												<input
													type="text"
													value={editForm.customIndustry}
													onChange={(e) => setEditForm({ ...editForm, customIndustry: e.target.value })}
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
													placeholder="Précisez le secteur d'activité"
													required
												/>
											</div>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Localisation
										</label>
										<input
											type="text"
											value={editForm.location}
											onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
											placeholder="Ville, Adresse"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Description
										</label>
										<textarea
											value={editForm.companyDescription}
											onChange={(e) => setEditForm({ ...editForm, companyDescription: e.target.value })}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
											rows="3"
											placeholder="Description de l'entreprise"
											required
										/>
									</div>
								</div>
							</div>

							{/* Boutons d'action */}
							<div className="sticky bottom-0 bg-white pt-4 border-t flex justify-end space-x-4">
								<button
									type="button"
									onClick={() => setIsEditModalOpen(false)}
									className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
								>
									Annuler
								</button>
								<button
									type="submit"
									className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
								>
									Enregistrer les modifications
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default RecruitersManagementPage; 
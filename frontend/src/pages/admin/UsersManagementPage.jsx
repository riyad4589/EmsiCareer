// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { axiosInstance } from "../../lib/axios";
// import { toast } from "react-hot-toast";
// import { Edit, Trash2, Lock, Plus, Eye, EyeOff, Users, X, LayoutDashboard, Building2, FileText } from "lucide-react";
// import { useState, useEffect } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { invalidateConnectionQueries } from "../../utils/queryUtils";

// const AdminNavbar = () => {
// 	const location = useLocation();
// 	// const navItems = [
// 	// 	{ name: "Tableau de bord", path: "/admin", icon: LayoutDashboard },
// 	// 	{ name: "Utilisateurs", path: "/admin/users", icon: Users },
// 	// 	{ name: "Recruteurs", path: "/admin/recruiters", icon: Building2 },
// 	// 	{ name: "Posts", path: "/admin/posts", icon: FileText },
// 	// ];
// };

// const UsersManagementPage = () => {
// 	const [editingUser, setEditingUser] = useState(null);
// 	const [selectedUser, setSelectedUser] = useState(null);
// 	const [isCreating, setIsCreating] = useState(false);
// 	const [showPassword, setShowPassword] = useState(false);
// 	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
// 	const [passwordStrength, setPasswordStrength] = useState(0);
// 	const [roleFilter, setRoleFilter] = useState("all");
// 	const [editForm, setEditForm] = useState({
// 		name: "",
// 		emailEdu: "",
// 		emailPersonelle: "",
// 		role: "",
// 		status: "",
// 		profilePicture: null,
// 	});
// 	const [createForm, setCreateForm] = useState({
// 		name: "",
// 		emailEdu: "",
// 		emailPersonelle: "",
// 		username: "",
// 		password: "",
// 		confirmPassword: "",
// 		role: "user",
// 		status: "active",
// 		phone: "",
// 		about: "",
// 		headline: "",
// 		// Réseaux sociaux
// 		linkedin: "",
// 		github: "",
// 		socialLinks: {
// 			linkedin: "",
// 			twitter: "",
// 			facebook: ""
// 		},
// 		// Champs spécifiques aux recruteurs
// 		companyName: "",
// 		companyLogo: "",
// 		industry: "",
// 		location: "",
// 		description: "",
// 		companyDescription: "",
// 		website: "",
// 		// Champs spécifiques aux utilisateurs
// 		skills: [],
// 		cv: "",
// 		// Champs spécifiques aux admins
// 		permissions: [],
// 		department: "",
// 		// Photo de profil
// 		profilePicture: null,
// 	});
// 	const [passwordForm, setPasswordForm] = useState({
// 		password: "",
// 		confirmPassword: "",
// 	});
// 	const [passwordMatch, setPasswordMatch] = useState(true);
// 	const [createPasswordStrength, setCreatePasswordStrength] = useState(0);
// 	const [createPasswordMatch, setCreatePasswordMatch] = useState(true);
// 	const [showCreatePassword, setShowCreatePassword] = useState(false);
// 	const [showCreateConfirmPassword, setShowCreateConfirmPassword] = useState(false);

// 	const queryClient = useQueryClient();

// 	const { data: usersData, isLoading, error } = useQuery({
// 		queryKey: ["usersWithConnections"],
// 		queryFn: async () => {
// 			try {
// 				const response = await axiosInstance.get("/admin/users");
// 				console.log("Réponse du serveur:", response.data);
// 				return response.data;
// 			} catch (error) {
// 				console.error("Erreur lors de la récupération des utilisateurs:", error);
// 				throw new Error(error.response?.data?.message || "Une erreur est survenue lors du chargement des utilisateurs");
// 			}
// 		},
// 		staleTime: 1000 * 60 * 5, // Cache pour 5 minutes
// 		cacheTime: 1000 * 60 * 30, // Garde en cache pendant 30 minutes
// 		retry: 3, // Réessaie 3 fois en cas d'échec
// 		refetchOnWindowFocus: true, // Rafraîchit les données quand la fenêtre regagne le focus
// 	});

// 	console.log("Données des utilisateurs:", usersData);
// 	const users = usersData || [];
// 	console.log("Liste des utilisateurs:", users);

// 	const { mutate: updateUser } = useMutation({
// 		mutationFn: (userData) => {
// 			const { _id, formData, ...updateData } = userData;
			
// 			// Si on a un FormData (avec fichier), l'utiliser
// 			if (formData) {
// 				return axiosInstance.put(`/admin/users/${_id}`, formData, {
// 					headers: {
// 						'Content-Type': 'multipart/form-data',
// 					},
// 				});
// 			}
			
// 			// Sinon, utiliser les données simples
// 			return axiosInstance.put(`/admin/users/${_id}`, updateData);
// 		},
// 		onSuccess: () => {
// 			queryClient.invalidateQueries(["usersWithConnections"]);
// 			toast.success("Utilisateur mis à jour avec succès");
// 			setEditingUser(null);
// 		},
// 		onError: (error) => {
// 			toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
// 		},
// 	});

// 	const { mutate: updatePassword } = useMutation({
// 		mutationFn: (data) => axiosInstance.put(`/admin/users/${data.userId}/password`, { password: data.password }),
// 		onSuccess: () => {
// 			toast.success("Mot de passe mis à jour avec succès");
// 			setSelectedUser(null);
// 			setPasswordForm({ password: "", confirmPassword: "" });
// 		},
// 		onError: (error) => {
// 			toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du mot de passe");
// 		},
// 	});

// 	const { mutate: deleteUser } = useMutation({
// 		mutationFn: (userId) => axiosInstance.delete(`/admin/users/${userId}`),
// 		onSuccess: () => {
// 			queryClient.invalidateQueries(["usersWithConnections"]);
// 			toast.success("Utilisateur supprimé avec succès");
// 		},
// 		onError: (error) => {
// 			toast.error(error.response?.data?.message || "Erreur lors de la suppression");
// 		},
// 	});

// 	const { mutate: deleteConnection } = useMutation({
// 		mutationFn: (connectionUserId) => 
// 			axiosInstance.delete(`/connections/${connectionUserId}`),
// 		onSuccess: () => {
// 			queryClient.invalidateQueries(["userConnections", userId]);
// 			queryClient.invalidateQueries(["usersWithConnections"]);
// 			invalidateConnectionQueries(queryClient);
// 			toast.success("Connexion supprimée avec succès");
// 		},
// 		onError: (error) => {
// 			toast.error(error.response?.data?.message || "Erreur lors de la suppression de la connexion");
// 		},
// 	});

// 	const { mutate: createUser } = useMutation({
// 		mutationFn: (userData) => {
// 			// Si c'est un FormData (avec fichier), utiliser les headers multipart
// 			if (userData instanceof FormData) {
// 				return axiosInstance.post("/admin/users", userData, {
// 					headers: {
// 						'Content-Type': 'multipart/form-data',
// 					},
// 				});
// 			}
			
// 			// Sinon, utiliser les données simples
// 			return axiosInstance.post("/admin/users", userData);
// 		},
// 		onSuccess: () => {
// 			queryClient.invalidateQueries(["usersWithConnections"]);
// 			toast.success("Utilisateur créé avec succès");
// 			setIsCreating(false);
// 			setCreateForm({
// 				name: "",
// 				emailEdu: "",
// 				emailPersonelle: "",
// 				username: "",
// 				password: "",
// 				confirmPassword: "",
// 				role: "user",
// 				status: "active",
// 				phone: "",
// 				about: "",
// 				headline: "",
// 				linkedin: "",
// 				github: "",
// 				socialLinks: {
// 					linkedin: "",
// 					twitter: "",
// 					facebook: ""
// 				},
// 				companyName: "",
// 				companyLogo: "",
// 				industry: "",
// 				location: "",
// 				description: "",
// 				companyDescription: "",
// 				website: "",
// 				skills: [],
// 				cv: "",
// 				permissions: [],
// 				department: "",
// 				profilePicture: null,
// 			});
// 		},
// 		onError: (error) => {
// 			toast.error(error.response?.data?.message || "Erreur lors de la création");
// 		},
// 	});

// 	const calculatePasswordStrength = (password) => {
// 		let strength = 0;
// 		if (password.length >= 8) strength += 1;
// 		if (/[A-Z]/.test(password)) strength += 1;
// 		if (/[a-z]/.test(password)) strength += 1;
// 		if (/[0-9]/.test(password)) strength += 1;
// 		if (/[^A-Za-z0-9]/.test(password)) strength += 1;
// 		return strength;
// 	};

// 	const getPasswordStrengthColor = (strength) => {
// 		switch (strength) {
// 			case 0:
// 			case 1:
// 				return "bg-red-500";
// 			case 2:
// 			case 3:
// 				return "bg-yellow-500";
// 			case 4:
// 			case 5:
// 				return "bg-green-500";
// 			default:
// 				return "bg-gray-200";
// 		}
// 	};

// 	const getPasswordStrengthText = (strength) => {
// 		switch (strength) {
// 			case 0:
// 			case 1:
// 				return "Très faible";
// 			case 2:
// 			case 3:
// 				return "Moyen";
// 			case 4:
// 			case 5:
// 				return "Fort";
// 			default:
// 				return "";
// 		}
// 	};

// 	const handlePasswordChange = (e) => {
// 		const newPassword = e.target.value;
// 		setPasswordForm(prev => ({ ...prev, password: newPassword }));
// 		setPasswordStrength(calculatePasswordStrength(newPassword));
// 		setPasswordMatch(newPassword === passwordForm.confirmPassword);
// 	};

// 	const handleConfirmPasswordChange = (e) => {
// 		const newConfirmPassword = e.target.value;
// 		setPasswordForm(prev => ({ ...prev, confirmPassword: newConfirmPassword }));
// 		setPasswordMatch(newConfirmPassword === passwordForm.password);
// 	};

// 	const handlePasswordSubmit = (e) => {
// 		e.preventDefault();
// 		if (passwordForm.password !== passwordForm.confirmPassword) {
// 			toast.error("Les mots de passe ne correspondent pas");
// 			return;
// 		}
// 		if (passwordStrength < 3) {
// 			toast.error("Le mot de passe est trop faible. Veuillez utiliser un mot de passe plus fort.");
// 			return;
// 		}
// 		updatePassword({ userId: selectedUser._id, password: passwordForm.password });
// 	};

// 	const handleEdit = (user) => {
// 		setEditingUser(user._id);
// 		setEditForm({
// 			name: user.name,
// 			emailEdu: user.emailEdu,
// 			emailPersonelle: user.emailPersonelle,
// 			role: user.role,
// 			status: user.status,
// 			profilePicture: null, // Pour la nouvelle image sélectionnée
// 		});
// 	};

// 	const handleSubmit = async (e) => {
// 		e.preventDefault();
		
// 		try {
// 			const formData = new FormData();
// 			formData.append('name', editForm.name);
// 			formData.append('emailEdu', editForm.emailEdu);
// 			formData.append('emailPersonelle', editForm.emailPersonelle);
// 			formData.append('role', editForm.role);
// 			formData.append('status', editForm.status);
			
// 			// Ajouter la photo de profil si une nouvelle a été sélectionnée
// 			if (editForm.profilePicture instanceof File) {
// 				formData.append('profilePicture', editForm.profilePicture);
// 			}
			
// 			await updateUser({ _id: editingUser, formData });
// 			setEditingUser(null);
// 		} catch (error) {
// 			console.error("Erreur lors de la modification:", error);
// 		}
// 	};

// 	const handleCreateSubmit = async (e) => {
// 		e.preventDefault();
		
// 		// Validation des mots de passe
// 		if (createForm.password !== createForm.confirmPassword) {
// 			toast.error("Les mots de passe ne correspondent pas");
// 			return;
// 		}

// 		if (createPasswordStrength < 3) {
// 			toast.error("Le mot de passe doit être au moins moyen (3/5)");
// 			return;
// 		}

// 		// Validation des champs requis selon le rôle
// 		if (createForm.role === "recruteur") {
// 			if (!createForm.companyName) {
// 				toast.error("Le nom de l'entreprise est requis pour les recruteurs");
// 				return;
// 			}
// 			if (!createForm.industry) {
// 				toast.error("Le secteur d'activité est requis pour les recruteurs");
// 				return;
// 			}
// 			if (!createForm.location) {
// 				toast.error("La localisation est requise pour les recruteurs");
// 				return;
// 			}
// 			if (!createForm.description) {
// 				toast.error("La description de l'entreprise est requise pour les recruteurs");
// 				return;
// 			}
// 		}

// 		try {
// 			const formData = new FormData();
			
// 			// Ajouter tous les champs textuels
// 			formData.append('name', createForm.name);
// 			formData.append('emailEdu', createForm.emailEdu);
// 			formData.append('emailPersonelle', createForm.emailPersonelle);
// 			formData.append('username', createForm.username);
// 			formData.append('password', createForm.password);
// 			formData.append('role', createForm.role);
// 			formData.append('status', createForm.status);
// 			formData.append('phone', createForm.phone);
// 			formData.append('about', createForm.about);
// 			formData.append('headline', createForm.headline);
// 			formData.append('linkedin', createForm.linkedin);
// 			formData.append('github', createForm.github);
// 			formData.append('socialLinks', JSON.stringify(createForm.socialLinks));
// 			formData.append('companyName', createForm.companyName);
// 			formData.append('companyLogo', createForm.companyLogo);
// 			formData.append('industry', createForm.industry);
// 			formData.append('location', createForm.location);
// 			formData.append('description', createForm.description);
// 			formData.append('companyDescription', createForm.companyDescription);
// 			formData.append('website', createForm.website);
// 			formData.append('skills', JSON.stringify(createForm.skills));
// 			formData.append('cv', createForm.cv);
// 			formData.append('permissions', JSON.stringify(createForm.permissions));
// 			formData.append('department', createForm.department);
			
// 			// Ajouter la photo de profil si sélectionnée
// 			if (createForm.profilePicture instanceof File) {
// 				formData.append('profilePicture', createForm.profilePicture);
// 			}

// 			await createUser(formData);
// 		} catch (error) {
// 			console.error("Erreur lors de la création:", error);
// 		}
// 	};

// 	// Filtrer les utilisateurs en fonction du rôle sélectionné
// 	const filteredUsers = users.filter(user => {
// 		if (roleFilter === "all") return true;
// 		return user.role === roleFilter;
// 	});

// 	// Composant pour afficher les connexions d'un utilisateur
// 	const UserConnections = ({ userId }) => {
// 		const { data: connectionsData, isLoading: connectionsLoading } = useQuery({
// 			queryKey: ["userConnections", userId],
// 			queryFn: async () => {
// 				const response = await axiosInstance.get(`/connections/user/${userId}`);
// 				return response.data.data;
// 			},
// 			enabled: !!userId,
// 		});

// 		if (connectionsLoading) {
// 			return <p className="text-sm text-gray-500 text-center py-2">Chargement...</p>;
// 		}

// 		const connections = connectionsData || [];

// 		if (connections.length === 0) {
// 			return <p className="text-sm text-gray-500 text-center py-2">Aucune connexion</p>;
// 		}

// 		return (
// 			<div className="space-y-2">
// 				{connections.map((connection) => (
// 					<div key={connection._id} className="flex items-center justify-between p-1 hover:bg-gray-50 rounded group">
// 						<div className="flex items-center space-x-2">
// 							<img
// 								src={connection.profilePicture || "/avatar.png"}
// 								alt={connection.name}
// 								className="w-6 h-6 rounded-full"
// 							/>
// 							<div className="text-sm">
// 								<span className="font-medium">{connection.name}</span>
// 								{connection.headline && (
// 									<span className="text-gray-500 text-xs block">{connection.headline}</span>
// 								)}
// 							</div>
// 						</div>
// 						<button
// 							onClick={() => {
// 								if (window.confirm(`Êtes-vous sûr de vouloir supprimer la connexion avec ${connection.name} ?`)) {
// 									deleteConnection(connection._id);
// 								}
// 							}}
// 							className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
// 							title="Supprimer la connexion"
// 						>
// 							<Trash2 size={16} />
// 						</button>
// 					</div>
// 				))}
// 			</div>
// 		);
// 	};

// 	// Validation du mot de passe
// 	const validatePassword = (password) => {
// 		let strength = 0;
// 		if (password.length >= 8) strength++;
// 		if (/[a-z]/.test(password)) strength++;
// 		if (/[A-Z]/.test(password)) strength++;
// 		if (/[0-9]/.test(password)) strength++;
// 		if (/[^A-Za-z0-9]/.test(password)) strength++;
// 		return strength;
// 	};

// 	// Vérification de la correspondance des mots de passe
// 	useEffect(() => {
// 		setCreatePasswordMatch(createForm.password === createForm.confirmPassword);
// 		setCreatePasswordStrength(validatePassword(createForm.password));
// 	}, [createForm.password, createForm.confirmPassword]);

// 	// Vérification de la correspondance des mots de passe pour la modification
// 	useEffect(() => {
// 		setPasswordMatch(passwordForm.password === passwordForm.confirmPassword);
// 	}, [passwordForm.password, passwordForm.confirmPassword]);

// 	if (isLoading) {
// 		return (
// 			<div className="flex items-center justify-center min-h-screen">
// 				<div className="text-center">
// 					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
// 					<p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
// 				</div>
// 			</div>
// 		);
// 	}

// 	if (error) {
// 		return (
// 			<div className="flex items-center justify-center min-h-screen">
// 				<div className="text-center">
// 					<p className="text-red-500 text-lg">Une erreur est survenue lors du chargement des utilisateurs</p>
// 					<p className="text-gray-600 mt-2">{error.message}</p>
// 				</div>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="min-h-screen bg-gray-50 pt-16">
// 			<AdminNavbar />
// 			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
// 				<div className="flex justify-between items-center mb-6">
// 					<h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
// 					<div className="flex items-center space-x-4">
// 						{/* Filtre par rôle */}
// 						<div className="flex items-center space-x-2">
// 							<label htmlFor="roleFilter" className="text-sm font-medium text-gray-700">
// 								Filtrer par rôle:
// 							</label>
// 							<select
// 								id="roleFilter"
// 								value={roleFilter}
// 								onChange={(e) => setRoleFilter(e.target.value)}
// 								className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
// 							>
// 								<option value="all">Tous les rôles</option>
// 								<option value="user">Utilisateur</option>
// 								<option value="recruteur">Recruteur</option>
// 								<option value="admin">Administrateur</option>
// 							</select>
// 						</div>
// 						<button
// 							onClick={() => setIsCreating(true)}
// 							className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
// 						>
// 							<Plus className="h-5 w-5 mr-2" />
// 							Nouvel utilisateur
// 						</button>
// 					</div>
// 				</div>

// 				<div className="bg-white shadow rounded-lg overflow-hidden">
// 					<table className="min-w-full divide-y divide-gray-200">
// 						<thead className="bg-gray-50">
// 							<tr>
// 								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// 									Nom
// 								</th>
// 								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// 									Email Educatif
// 								</th>
// 								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// 									Rôle
// 								</th>
// 								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// 									Statut
// 								</th>
// 								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
// 									Actions
// 								</th>
// 							</tr>
// 						</thead>
// 						<tbody className="bg-white divide-y divide-gray-200">
// 							{filteredUsers.length > 0 ? (
// 								filteredUsers.map((user) => (
// 									<tr key={user._id}>
// 										{editingUser === user._id ? (
// 											<td colSpan="6" className="px-6 py-4">
// 												<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
// 													<div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
// 														<div className="p-6 border-b border-gray-200">
// 															<div className="flex justify-between items-center">
// 																<div>
// 																	<h2 className="text-2xl font-bold text-gray-900">Modifier l'utilisateur</h2>
// 																	<p className="mt-1 text-sm text-gray-500">Modifiez les informations de l'utilisateur</p>
// 																</div>
// 																<button
// 																	onClick={() => setEditingUser(null)}
// 																	className="text-gray-400 hover:text-gray-500 focus:outline-none"
// 																>
// 																	<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
// 																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
// 																	</svg>
// 																</button>
// 															</div>
// 														</div>
// 														<form onSubmit={handleSubmit} className="p-6">
// 															<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// 																<div className="space-y-4">
// 																	<div>
// 																		<label className="block text-sm font-medium text-gray-700 mb-1">
// 																			Nom complet <span className="text-red-500">*</span>
// 																		</label>
// 																		<input
// 																			type="text"
// 																			value={editForm.name}
// 																			onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
// 																			className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
// 																			required
// 																		/>
// 																	</div>
// 																	<div>
// 																		<label className="block text-sm font-medium text-gray-700 mb-1">Email Professionnelle</label>
// 																		<input
// 																			type="email"
// 																			value={editForm.emailEdu}
// 																			onChange={(e) => setEditForm({ ...editForm, emailEdu: e.target.value })}
// 																			className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
// 																			required
// 																		/>
// 																	</div>
// 																</div>
// 																<div className="space-y-4">
// 																	<div>
// 																		<label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
// 																		<select
// 																			value={editForm.role}
// 																			onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
// 																			className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
// 																		>
// 																			<option value="user">Utilisateur</option>
// 																			<option value="recruteur">Recruteur</option>
// 																			<option value="admin">Administrateur</option>
// 																		</select>
// 																	</div>
// 																	<div>
// 																		<label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
// 																		<select
// 																			value={editForm.status}
// 																			onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
// 																			className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
// 																		>
// 																			<option value="active">Actif</option>
// 																			<option value="pending">En attente</option>
// 																			<option value="rejected">Rejeté</option>
// 																		</select>
// 																	</div>
// 																	<div>
// 																		<label className="block text-sm font-medium text-gray-700 mb-1">Connexions</label>
// 																		<UserConnections userId={user._id} />
// 																	</div>
// 																</div>
// 															</div>
															
// 															{/* Photo de profil */}
// 															<div className="mt-6">
// 																<label className="block text-sm font-medium text-gray-700 mb-2">
// 																	Photo de profil
// 																</label>
// 																<div className="flex items-center space-x-4">
// 																	<div className="relative">
// 																		<img
// 																			src={editForm.profilePicture ? URL.createObjectURL(editForm.profilePicture) : (user.profilePicture || "/avatar.png")}
// 																			alt="Photo de profil"
// 																			className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
// 																		/>
// 																		{editForm.profilePicture && (
// 																			<button
// 																				type="button"
// 																				onClick={() => setEditForm({ ...editForm, profilePicture: null })}
// 																				className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
// 																			>
// 																				×
// 																			</button>
// 																		)}
// 																	</div>
// 																	<div className="flex-1">
// 																		<input
// 																			type="file"
// 																			accept="image/*"
// 																			onChange={(e) => {
// 																				const file = e.target.files[0];
// 																				if (file) {
// 																					if (file.size > 5 * 1024 * 1024) {
// 																						toast.error("L'image ne doit pas dépasser 5MB");
// 																						return;
// 																					}
// 																					setEditForm({ ...editForm, profilePicture: file });
// 																				}
// 																			}}
// 																			className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
// 																		/>
// 																		<p className="text-xs text-gray-500 mt-1">
// 																			Formats acceptés : JPG, PNG, GIF. Taille max : 5MB
// 																		</p>
// 																	</div>
// 																</div>
// 															</div>
															
// 															<div className="mt-8 flex justify-end space-x-3">
// 																<button
// 																	type="button"
// 																	onClick={() => setEditingUser(null)}
// 																	className="px-6 py-2.5 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
// 																>
// 																	Annuler
// 																</button>
// 																<button
// 																	type="submit"
// 																	className="px-6 py-2.5 bg-green-600 text-sm font-medium text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
// 																>
// 																	Enregistrer
// 																</button>
// 															</div>
// 														</form>
// 													</div>
// 												</div>
// 											</td>
// 										) : (
// 											<>
// 												<td className="px-6 py-4 whitespace-nowrap">
// 													<div className="flex items-center">
// 														<div className="flex-shrink-0 h-10 w-10">
// 															<img
// 																className="h-10 w-10 rounded-full"
// 																src={user.profilePicture || "/avatar.png"}
// 																alt={user.name}
// 															/>
// 														</div>
// 														<div className="ml-4">
// 															<div className="text-sm font-medium text-gray-900">{user.name}</div>
// 															<div className="text-sm text-gray-500">@{user.username}</div>
// 														</div>
// 													</div>
// 												</td>
// 												<td className="px-6 py-4 whitespace-nowrap">
// 													<div className="text-sm text-gray-900">{user.emailEdu}</div>
// 												</td>
// 												<td className="px-6 py-4 whitespace-nowrap">
// 													<span
// 														className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
// 															user.role === "admin"
// 																? "bg-purple-100 text-purple-800"
// 																: user.role === "recruteur"
// 																? "bg-blue-100 text-blue-800"
// 																: "bg-green-100 text-green-800"
// 														}`}
// 													>
// 														{user.role === "admin"
// 															? "Administrateur"
// 															: user.role === "recruteur"
// 															? "Recruteur"
// 															: "Utilisateur"}
// 													</span>
// 												</td>
// 												<td className="px-6 py-4 whitespace-nowrap">
// 													<span
// 														className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
// 															user.status === "active"
// 																? "bg-green-100 text-green-800"
// 																: user.status === "pending"
// 																? "bg-yellow-100 text-yellow-800"
// 																: "bg-red-100 text-red-800"
// 														}`}
// 													>
// 														{user.status === "active"
// 															? "Actif"
// 															: user.status === "pending"
// 															? "En attente"
// 															: "Rejeté"}
// 													</span>
// 												</td>
// 												<td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
// 													<div className="flex items-center justify-center space-x-4">
// 														<button
// 															onClick={() => handleEdit(user)}
// 															className="text-green-600 hover:text-green-900"
// 														>
// 															<Edit size={18} />
// 														</button>
// 														<button
// 															onClick={() => setSelectedUser(user)}
// 															className="text-green-600 hover:text-green-900"
// 														>
// 															<Lock size={18} />
// 														</button>
// 														<button
// 															onClick={() => {
// 																if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
// 																	deleteUser(user._id);
// 																}
// 															}}
// 															className="text-red-600 hover:text-red-900"
// 														>
// 															<Trash2 size={18} />
// 														</button>
// 													</div>
// 												</td>
// 											</>
// 										)}
// 									</tr>
// 								))
// 							) : (
// 								<tr>
// 									<td colSpan="6" className="px-6 py-4 text-center text-gray-500">
// 										Aucun utilisateur trouvé
// 									</td>
// 								</tr>
// 							)}
// 						</tbody>
// 					</table>
// 				</div>
// 			</div>

// 			{/* Modal de changement de mot de passe */}
// 			{selectedUser && (
// 				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
// 					<div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
// 						<div className="p-6 border-b border-gray-200">
// 							<div className="flex justify-between items-center">
// 								<div>
// 									<h2 className="text-2xl font-bold text-gray-900">Changer le mot de passe</h2>
// 									<p className="mt-1 text-sm text-gray-500">Pour {selectedUser.name}</p>
// 								</div>
// 								<button
// 									onClick={() => setSelectedUser(null)}
// 									className="text-gray-400 hover:text-gray-500 focus:outline-none"
// 								>
// 									<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
// 										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
// 									</svg>
// 								</button>
// 							</div>
// 						</div>
// 						<form onSubmit={handlePasswordSubmit} className="p-6">
// 							<div className="space-y-4">
// 								<div>
// 									<label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
// 									<div className="relative">
// 										<input
// 											type={showPassword ? "text" : "password"}
// 											value={passwordForm.password}
// 											onChange={handlePasswordChange}
// 											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
// 											required
// 										/>
// 										<button
// 											type="button"
// 											onClick={() => setShowPassword(!showPassword)}
// 											className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
// 										>
// 											{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
// 										</button>
// 									</div>
// 									{passwordForm.password && (
// 										<div className="mt-2">
// 											<div className="flex space-x-1">
// 												{[...Array(5)].map((_, i) => (
// 													<div
// 														key={i}
// 														className={`h-1 w-full rounded-full ${
// 															i < passwordStrength ? getPasswordStrengthColor(passwordStrength) : "bg-gray-200"
// 														}`}
// 													/>
// 												))}
// 											</div>
// 											<p className={`text-sm mt-1 ${
// 												passwordStrength < 3 ? "text-red-500" : "text-green-500"
// 											}`}>
// 												{getPasswordStrengthText(passwordStrength)}
// 											</p>
// 										</div>
// 									)}
// 								</div>
// 								<div>
// 									<label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
// 									<div className="relative">
// 										<input
// 											type={showConfirmPassword ? "text" : "password"}
// 											value={passwordForm.confirmPassword}
// 											onChange={handleConfirmPasswordChange}
// 											className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${
// 												passwordForm.confirmPassword
// 													? passwordMatch
// 														? "border-green-300"
// 														: "border-red-300"
// 													: "border-gray-300"
// 											}`}
// 											required
// 										/>
// 										<button
// 											type="button"
// 											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
// 											className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
// 										>
// 											{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
// 										</button>
// 									</div>
// 									{passwordForm.confirmPassword && !passwordMatch && (
// 										<p className="mt-1 text-sm text-red-500">Les mots de passe ne correspondent pas</p>
// 									)}
// 								</div>
// 							</div>
// 							<div className="mt-8 flex justify-end space-x-3">
// 								<button
// 									type="button"
// 									onClick={() => setSelectedUser(null)}
// 									className="px-6 py-2.5 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
// 								>
// 									Annuler
// 								</button>
// 								<button
// 									type="submit"
// 									className="px-6 py-2.5 bg-green-600 text-sm font-medium text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
// 								>
// 									Enregistrer
// 								</button>
// 							</div>
// 						</form>
// 					</div>
// 				</div>
// 			)}

// 			{/* Modal de création d'utilisateur */}
// 			{isCreating && (
// 				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
// 					<div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col">
// 						<div className="p-6 border-b border-gray-200 flex-shrink-0">
// 							<div className="flex justify-between items-center">
// 								<div>
// 									<h2 className="text-2xl font-bold text-gray-900">Créer un nouvel utilisateur</h2>
// 									<p className="mt-1 text-sm text-gray-500">Remplissez les informations de l'utilisateur</p>
// 								</div>
// 								<button
// 									onClick={() => setIsCreating(false)}
// 									className="text-gray-400 hover:text-gray-500 focus:outline-none"
// 								>
// 									<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
// 										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
// 									</svg>
// 								</button>
// 							</div>
// 						</div>
// 						<div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
// 							<form id="createUserForm" onSubmit={handleCreateSubmit} className="p-6">
// 								<div className="space-y-6">
// 									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// 										<div className="space-y-4">
// 											<div>
// 												<label className="block text-sm font-medium text-gray-700 mb-1">
// 													Nom complet <span className="text-red-500">*</span>
// 												</label>
// 												<input
// 													type="text"
// 													value={createForm.name}
// 													onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
// 													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
// 													required
// 												/>
// 											</div>
// 											<div>
// 												<label className="block text-sm font-medium text-gray-700 mb-1">
// 													Email Professionnelle <span className="text-red-500">*</span>
// 												</label>
// 												<input
// 													type="email"
// 													value={createForm.emailEdu}
// 													onChange={(e) => setCreateForm({ ...createForm, emailEdu: e.target.value })}
// 													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
// 													required
// 												/>
// 											</div>
// 											<div>
// 												<label className="block text-sm font-medium text-gray-700 mb-1">
// 													Email Personnel
// 												</label>
// 												<input
// 													type="email"
// 													value={createForm.emailPersonelle}
// 													onChange={(e) => setCreateForm({ ...createForm, emailPersonelle: e.target.value })}
// 													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
// 												/>
// 											</div>
// 										</div>
// 										<div className="space-y-4">
// 											<div>
// 												<label className="block text-sm font-medium text-gray-700 mb-1">
// 													Nom d'utilisateur <span className="text-red-500">*</span>
// 												</label>
// 												<input
// 													type="text"
// 													value={createForm.username}
// 													onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
// 													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
// 													required
// 												/>
// 											</div>
// 											<div>
// 												<label className="block text-sm font-medium text-gray-700 mb-1">
// 													Mot de passe *
// 												</label>
// 												<div className="relative">
// 													<input
// 														type={showCreatePassword ? "text" : "password"}
// 														value={createForm.password}
// 														onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
// 														className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 														required
// 													/>
// 													<button
// 														type="button"
// 														onClick={() => setShowCreatePassword(!showCreatePassword)}
// 														className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
// 													>
// 														{showCreatePassword ? <EyeOff size={20} /> : <Eye size={20} />}
// 													</button>
// 												</div>
// 												{/* Indicateur de force du mot de passe */}
// 												{createForm.password && (
// 													<div className="mt-2">
// 														<div className="flex space-x-1">
// 															{[...Array(5)].map((_, i) => (
// 																<div
// 																	key={i}
// 																	className={`h-1 flex-1 rounded ${
// 																		i < createPasswordStrength
// 																			? createPasswordStrength <= 2
// 																				? "bg-red-500"
// 																				: createPasswordStrength <= 3
// 																				? "bg-yellow-500"
// 																				: "bg-green-500"
// 																			: "bg-gray-200"
// 																	}`}
// 																/>
// 															))}
// 														</div>
// 														<p className={`text-xs mt-1 ${
// 															createPasswordStrength <= 2
// 																? "text-red-600"
// 																: createPasswordStrength <= 3
// 																? "text-yellow-600"
// 																: "text-green-600"
// 														}`}>
// 															{createPasswordStrength <= 2
// 																? "Faible"
// 																: createPasswordStrength <= 3
// 																? "Moyen"
// 																: "Fort"}
// 														</p>
// 													</div>
// 												)}
// 											</div>

// 											<div>
// 												<label className="block text-sm font-medium text-gray-700 mb-1">
// 													Confirmer le mot de passe *
// 												</label>
// 												<div className="relative">
// 													<input
// 														type={showCreateConfirmPassword ? "text" : "password"}
// 														value={createForm.confirmPassword}
// 														onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
// 														className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
// 															createForm.confirmPassword
// 																? createPasswordMatch
// 																	? "border-green-300 focus:ring-green-500"
// 																	: "border-red-300 focus:ring-red-500"
// 																: "border-gray-300 focus:ring-blue-500"
// 														}`}
// 														required
// 													/>
// 													<button
// 														type="button"
// 														onClick={() => setShowCreateConfirmPassword(!showCreateConfirmPassword)}
// 														className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
// 													>
// 														{showCreateConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
// 													</button>
// 												</div>
// 												{createForm.confirmPassword && !createPasswordMatch && (
// 													<p className="text-red-600 text-sm mt-1">Les mots de passe ne correspondent pas</p>
// 												)}
// 												{createForm.confirmPassword && createPasswordMatch && (
// 													<p className="text-green-600 text-sm mt-1">Les mots de passe correspondent</p>
// 												)}
// 											</div>
// 										</div>
// 									</div>

// 									{/* Photo de profil pour tous les utilisateurs */}
// 									<div className="bg-gray-50 p-4 rounded-lg">
// 										<h3 className="text-lg font-semibold text-gray-800 mb-3">Photo de profil</h3>
// 										<div className="flex items-center space-x-4">
// 											<div className="relative">
// 												<img
// 													src={createForm.profilePicture ? URL.createObjectURL(createForm.profilePicture) : "/avatar.png"}
// 													alt="Photo de profil"
// 													className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
// 												/>
// 												{createForm.profilePicture && (
// 													<button
// 														type="button"
// 														onClick={() => setCreateForm({ ...createForm, profilePicture: null })}
// 														className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
// 													>
// 														×
// 													</button>
// 												)}
// 											</div>
// 											<div className="flex-1">
// 												<input
// 													type="file"
// 													accept="image/*"
// 													onChange={(e) => {
// 														const file = e.target.files[0];
// 														if (file) {
// 															if (file.size > 5 * 1024 * 1024) {
// 																toast.error("L'image ne doit pas dépasser 5MB");
// 																return;
// 															}
// 															setCreateForm({ ...createForm, profilePicture: file });
// 														}
// 													}}
// 													className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
// 												/>
// 												<p className="text-xs text-gray-500 mt-1">
// 													Formats acceptés : JPG, PNG, GIF. Taille max : 5MB
// 												</p>
// 											</div>
// 										</div>
// 									</div>

// 									{/* Champs spécifiques selon le rôle */}
// 									{createForm.role === "recruteur" && (
// 										<>
// 											{/* Informations de l'entreprise */}
// 											<div className="bg-blue-50 p-4 rounded-lg mb-4">
// 												<h3 className="text-lg font-semibold text-blue-800 mb-3">Informations de l'entreprise</h3>
												
// 												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 													<div>
// 														<label className="block text-sm font-medium text-gray-700 mb-1">
// 															Nom de l'entreprise *
// 														</label>
// 														<input
// 															type="text"
// 															value={createForm.companyName}
// 															onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
// 															className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 															required
// 														/>
// 													</div>
// 													<div>
// 														<label className="block text-sm font-medium text-gray-700 mb-1">
// 															Logo de l'entreprise
// 														</label>
// 														<input
// 															type="url"
// 															value={createForm.companyLogo}
// 															onChange={(e) => setCreateForm({ ...createForm, companyLogo: e.target.value })}
// 															className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 															placeholder="https://example.com/logo.png"
// 														/>
// 													</div>
// 												</div>
// 												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 													<div>
// 														<label className="block text-sm font-medium text-gray-700 mb-1">
// 															Secteur d'activité *
// 														</label>
// 														<select
// 															value={createForm.industry}
// 															onChange={(e) => setCreateForm({ ...createForm, industry: e.target.value })}
// 															className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 															required
// 														>
// 															<option value="">Sélectionner un secteur</option>
// 															<option value="technology">Technologie</option>
// 															<option value="healthcare">Santé</option>
// 															<option value="finance">Finance</option>
// 															<option value="education">Éducation</option>
// 															<option value="manufacturing">Industrie</option>
// 															<option value="retail">Commerce</option>
// 															<option value="consulting">Conseil</option>
// 															<option value="marketing">Marketing</option>
// 															<option value="design">Design</option>
// 															<option value="sales">Ventes</option>
// 															<option value="hr">Ressources Humaines</option>
// 															<option value="legal">Juridique</option>
// 															<option value="other">Autre</option>
// 														</select>
// 													</div>
// 													<div>
// 														<label className="block text-sm font-medium text-gray-700 mb-1">
// 															Localisation *
// 														</label>
// 														<input
// 															type="text"
// 															value={createForm.location}
// 															onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
// 															className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 															placeholder="Ville, Pays"
// 															required
// 														/>
// 													</div>
// 												</div>
// 												<div>
// 													<label className="block text-sm font-medium text-gray-700 mb-1">
// 														Site web
// 													</label>
// 													<input
// 														type="url"
// 														value={createForm.website}
// 														onChange={(e) => setCreateForm({ ...createForm, website: e.target.value })}
// 														className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 														placeholder="https://www.example.com"
// 													/>
// 												</div>
// 											</div>

// 											{/* Descriptions */}
// 											<div className="bg-green-50 p-4 rounded-lg mb-4">
// 												<h3 className="text-lg font-semibold text-green-800 mb-3">Descriptions</h3>
// 												<div>
// 													<label className="block text-sm font-medium text-gray-700 mb-1">
// 														Description de l'entreprise *
// 													</label>
// 													<textarea
// 														value={createForm.description}
// 														onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
// 														rows={3}
// 														className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 														placeholder="Décrivez votre entreprise, sa mission, ses valeurs..."
// 														required
// 													/>
// 												</div>
// 												<div className="mt-4">
// 													<label className="block text-sm font-medium text-gray-700 mb-1">
// 														Description complète
// 													</label>
// 													<textarea
// 														value={createForm.companyDescription}
// 														onChange={(e) => setCreateForm({ ...createForm, companyDescription: e.target.value })}
// 														rows={4}
// 														className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 														placeholder="Description détaillée de l'entreprise, son histoire, ses réalisations..."
// 													/>
// 												</div>
// 											</div>

// 											{/* Informations de contact professionnel */}
// 											<div className="bg-purple-50 p-4 rounded-lg mb-4">
// 												<h3 className="text-lg font-semibold text-purple-800 mb-3">Contact professionnel</h3>
// 												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 													<div>
// 														<label className="block text-sm font-medium text-gray-700 mb-1">
// 															Téléphone professionnel
// 														</label>
// 														<input
// 															type="tel"
// 															value={createForm.phone}
// 															onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
// 															className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 															placeholder="+33 1 23 45 67 89"
// 														/>
// 													</div>
// 													<div>
// 														<label className="block text-sm font-medium text-gray-700 mb-1">
// 															Titre professionnel
// 														</label>
// 														<input
// 															type="text"
// 															value={createForm.headline}
// 															onChange={(e) => setCreateForm({ ...createForm, headline: e.target.value })}
// 															className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 															placeholder="ex: Responsable RH, Directeur Commercial..."
// 														/>
// 													</div>
// 												</div>
// 												<div>
// 													<label className="block text-sm font-medium text-gray-700 mb-1">
// 														À propos du recruteur
// 													</label>
// 													<textarea
// 														value={createForm.about}
// 														onChange={(e) => setCreateForm({ ...createForm, about: e.target.value })}
// 														rows={3}
// 														className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 														placeholder="Présentez-vous en tant que recruteur..."
// 													/>
// 												</div>
// 											</div>

// 											{/* Réseaux sociaux professionnels */}
// 											<div className="bg-orange-50 p-4 rounded-lg mb-4">
// 												<h3 className="text-lg font-semibold text-orange-800 mb-3">Réseaux sociaux professionnels</h3>
// 												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 													<div>
// 														<label className="block text-sm font-medium text-gray-700 mb-1">
// 															LinkedIn
// 														</label>
// 														<input
// 															type="url"
// 															value={createForm.linkedin}
// 															onChange={(e) => setCreateForm({ ...createForm, linkedin: e.target.value })}
// 															className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 															placeholder="https://linkedin.com/in/username"
// 														/>
// 													</div>
// 													<div>
// 														<label className="block text-sm font-medium text-gray-700 mb-1">
// 															GitHub
// 														</label>
// 														<input
// 															type="url"
// 															value={createForm.github}
// 															onChange={(e) => setCreateForm({ ...createForm, github: e.target.value })}
// 															className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 															placeholder="https://github.com/username"
// 														/>
// 													</div>
// 												</div>
// 												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 													<div>
// 														<label className="block text-sm font-medium text-gray-700 mb-1">
// 															Twitter
// 														</label>
// 														<input
// 															type="url"
// 															value={createForm.socialLinks.twitter}
// 															onChange={(e) => setCreateForm({ 
// 																...createForm, 
// 																socialLinks: { ...createForm.socialLinks, twitter: e.target.value }
// 															})}
// 															className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 															placeholder="https://twitter.com/username"
// 														/>
// 													</div>
// 													<div>
// 														<label className="block text-sm font-medium text-gray-700 mb-1">
// 															Facebook
// 														</label>
// 														<input
// 															type="url"
// 															value={createForm.socialLinks.facebook}
// 															onChange={(e) => setCreateForm({ 
// 																...createForm, 
// 																socialLinks: { ...createForm.socialLinks, facebook: e.target.value }
// 															})}
// 															className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 															placeholder="https://facebook.com/username"
// 														/>
// 													</div>
// 												</div>
// 											</div>
// 										</>
// 									)}

// 									{createForm.role === "user" && (
// 										<>
// 											<div>
// 												<label className="block text-sm font-medium text-gray-700 mb-1">
// 													Téléphone
// 												</label>
// 												<input
// 													type="tel"
// 													value={createForm.phone}
// 													onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
// 													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 													placeholder="+33 1 23 45 67 89"
// 												/>
// 											</div>
// 											<div>
// 												<label className="block text-sm font-medium text-gray-700 mb-1">
// 													Titre professionnel
// 												</label>
// 												<input
// 													type="text"
// 													value={createForm.headline}
// 													onChange={(e) => setCreateForm({ ...createForm, headline: e.target.value })}
// 													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 													placeholder="ex: Développeur Full Stack"
// 												/>
// 											</div>
// 											<div>
// 												<label className="block text-sm font-medium text-gray-700 mb-1">
// 													À propos
// 												</label>
// 												<textarea
// 													value={createForm.about}
// 													onChange={(e) => setCreateForm({ ...createForm, about: e.target.value })}
// 													rows={3}
// 													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 													placeholder="Parlez-nous de vous..."
// 												/>
// 											</div>
// 											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 												<div>
// 													<label className="block text-sm font-medium text-gray-700 mb-1">
// 														LinkedIn
// 													</label>
// 													<input
// 														type="url"
// 														value={createForm.linkedin}
// 														onChange={(e) => setCreateForm({ ...createForm, linkedin: e.target.value })}
// 														className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 														placeholder="https://linkedin.com/in/username"
// 													/>
// 												</div>
// 												<div>
// 													<label className="block text-sm font-medium text-gray-700 mb-1">
// 														GitHub
// 													</label>
// 													<input
// 														type="url"
// 														value={createForm.github}
// 														onChange={(e) => setCreateForm({ ...createForm, github: e.target.value })}
// 														className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 														placeholder="https://github.com/username"
// 													/>
// 												</div>
// 											</div>
// 											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 												<div>
// 													<label className="block text-sm font-medium text-gray-700 mb-1">
// 														Twitter
// 													</label>
// 													<input
// 														type="url"
// 														value={createForm.socialLinks.twitter}
// 														onChange={(e) => setCreateForm({ 
// 															...createForm, 
// 															socialLinks: { ...createForm.socialLinks, twitter: e.target.value }
// 														})}
// 														className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 														placeholder="https://twitter.com/username"
// 													/>
// 												</div>
// 												<div>
// 													<label className="block text-sm font-medium text-gray-700 mb-1">
// 														Facebook
// 													</label>
// 													<input
// 														type="url"
// 														value={createForm.socialLinks.facebook}
// 														onChange={(e) => setCreateForm({ 
// 															...createForm, 
// 															socialLinks: { ...createForm.socialLinks, facebook: e.target.value }
// 														})}
// 														className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 														placeholder="https://facebook.com/username"
// 													/>
// 												</div>
// 											</div>
// 										</>
// 									)}

// 									{createForm.role === "admin" && (
// 										<>
// 											<div>
// 												<label className="block text-sm font-medium text-gray-700 mb-1">
// 													Département
// 												</label>
// 												<select
// 													value={createForm.department}
// 													onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
// 													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 												>
// 													<option value="">Sélectionner un département</option>
// 													<option value="technical">Technique</option>
// 													<option value="marketing">Marketing</option>
// 													<option value="sales">Ventes</option>
// 													<option value="hr">Ressources Humaines</option>
// 													<option value="finance">Finance</option>
// 													<option value="operations">Opérations</option>
// 												</select>
// 											</div>
// 										</>
// 									)}

// 									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 										<div>
// 											<label className="block text-sm font-medium text-gray-700 mb-1">
// 												Rôle *
// 											</label>
// 											<select
// 												value={createForm.role}
// 												onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
// 												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 											>
// 												<option value="user">Utilisateur</option>
// 												<option value="recruteur">Recruteur</option>
// 												<option value="admin">Administrateur</option>
// 											</select>
// 										</div>
// 										<div>
// 											<label className="block text-sm font-medium text-gray-700 mb-1">
// 												Statut *
// 											</label>
// 											<select
// 												value={createForm.status}
// 												onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
// 												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 											>
// 												<option value="active">Actif</option>
// 												<option value="pending">En attente</option>
// 												<option value="rejected">Rejeté</option>
// 											</select>
// 										</div>
// 																</div>
// 								</div>
// 								<button
// 									onClick={() => {
// 										const form = document.getElementById('createUserForm');
// 										if (form) {
// 											form.requestSubmit();
// 										}
// 									}}
// 									disabled={!createPasswordMatch || createPasswordStrength < 3}
// 									className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
// 										!createPasswordMatch || createPasswordStrength < 3
// 											? "bg-gray-400 cursor-not-allowed"
// 											: "bg-blue-600 hover:bg-blue-700"
// 									}`}
// 								>
// 									Crée l'utilisateur
// 								</button>
// 							</form>
// 						</div>
// 					</div>
// 				</div>
// 			)}
// 		</div>
// 	);
// };

// export default UsersManagementPage; 



import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import { Edit, Trash2, Lock, Plus, Eye, EyeOff, Users, X, LayoutDashboard, Building2, FileText, Shield, Activity, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { invalidateConnectionQueries } from "../../utils/queryUtils";

const AdminNavbar = () => {
  const location = useLocation();
  // const navItems = [
  //   { name: "Tableau de bord", path: "/admin", icon: LayoutDashboard },
  //   { name: "Utilisateurs", path: "/admin/users", icon: Users },
  //   { name: "Recruteurs", path: "/admin/recruiters", icon: Building2 },
  //   { name: "Posts", path: "/admin/posts", icon: FileText },
  // ];
};

const UsersManagementPage = () => {
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [roleFilter, setRoleFilter] = useState("all");
  const [editForm, setEditForm] = useState({
    name: "",
    emailEdu: "",
    emailPersonelle: "",
    role: "",
    status: "",
    profilePicture: null,
  });
  const [createForm, setCreateForm] = useState({
    name: "",
    emailEdu: "",
    emailPersonelle: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "user",
    status: "active",
    phone: "",
    about: "",
    headline: "",
    linkedin: "",
    github: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      facebook: ""
    },
    companyName: "",
    companyLogo: "",
    industry: "",
    location: "",
    description: "",
    companyDescription: "",
    website: "",
    skills: [],
    cv: "",
    permissions: [],
    department: "",
    profilePicture: null,
  });
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [createPasswordStrength, setCreatePasswordStrength] = useState(0);
  const [createPasswordMatch, setCreatePasswordMatch] = useState(true);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showCreateConfirmPassword, setShowCreateConfirmPassword] = useState(false);

  const queryClient = useQueryClient();

  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ["usersWithConnections"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/admin/users");
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Une erreur est survenue lors du chargement des utilisateurs");
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    retry: 3,
    refetchOnWindowFocus: true,
  });

  const users = usersData || [];

  const { mutate: updateUser } = useMutation({
    mutationFn: (userData) => {
      const { _id, formData, ...updateData } = userData;
      
      if (formData) {
        return axiosInstance.put(`/admin/users/${_id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      return axiosInstance.put(`/admin/users/${_id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["usersWithConnections"]);
      toast.success("Utilisateur mis à jour avec succès");
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    },
  });

  const { mutate: updatePassword } = useMutation({
    mutationFn: (data) => axiosInstance.put(`/admin/users/${data.userId}/password`, { password: data.password }),
    onSuccess: () => {
      toast.success("Mot de passe mis à jour avec succès");
      setSelectedUser(null);
      setPasswordForm({ password: "", confirmPassword: "" });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du mot de passe");
    },
  });

  const { mutate: deleteUser } = useMutation({
    mutationFn: (userId) => axiosInstance.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["usersWithConnections"]);
      toast.success("Utilisateur supprimé avec succès");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    },
  });

  const { mutate: deleteConnection } = useMutation({
    mutationFn: (connectionUserId) => 
      axiosInstance.delete(`/connections/${connectionUserId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["userConnections", userId]);
      queryClient.invalidateQueries(["usersWithConnections"]);
      invalidateConnectionQueries(queryClient);
      toast.success("Connexion supprimée avec succès");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression de la connexion");
    },
  });

  const { mutate: createUser } = useMutation({
    mutationFn: (userData) => {
      if (userData instanceof FormData) {
        return axiosInstance.post("/admin/users", userData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      return axiosInstance.post("/admin/users", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["usersWithConnections"]);
      toast.success("Utilisateur créé avec succès");
      setIsCreating(false);
      setCreateForm({
        name: "",
        emailEdu: "",
        emailPersonelle: "",
        username: "",
        password: "",
        confirmPassword: "",
        role: "user",
        status: "active",
        phone: "",
        about: "",
        headline: "",
        linkedin: "",
        github: "",
        socialLinks: {
          linkedin: "",
          twitter: "",
          facebook: ""
        },
        companyName: "",
        companyLogo: "",
        industry: "",
        location: "",
        description: "",
        companyDescription: "",
        website: "",
        skills: [],
        cv: "",
        permissions: [],
        department: "",
        profilePicture: null,
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
    updatePassword({ userId: selectedUser._id, password: passwordForm.password });
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({
      name: user.name,
      emailEdu: user.emailEdu,
      emailPersonelle: user.emailPersonelle,
      role: user.role,
      status: user.status,
      profilePicture: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('emailEdu', editForm.emailEdu);
      formData.append('emailPersonelle', editForm.emailPersonelle);
      formData.append('role', editForm.role);
      formData.append('status', editForm.status);
      
      if (editForm.profilePicture instanceof File) {
        formData.append('profilePicture', editForm.profilePicture);
      }
      
      await updateUser({ _id: editingUser, formData });
      setEditingUser(null);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    if (createForm.password !== createForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (createPasswordStrength < 3) {
      toast.error("Le mot de passe doit être au moins moyen (3/5)");
      return;
    }

    if (createForm.role === "recruteur") {
      if (!createForm.companyName) {
        toast.error("Le nom de l'entreprise est requis pour les recruteurs");
        return;
      }
      if (!createForm.industry) {
        toast.error("Le secteur d'activité est requis pour les recruteurs");
        return;
      }
      if (!createForm.location) {
        toast.error("La localisation est requise pour les recruteurs");
        return;
      }
      if (!createForm.description) {
        toast.error("La description de l'entreprise est requise pour les recruteurs");
        return;
      }
    }

    try {
      const formData = new FormData();
      
      formData.append('name', createForm.name);
      formData.append('emailEdu', createForm.emailEdu);
      formData.append('emailPersonelle', createForm.emailPersonelle);
      formData.append('username', createForm.username);
      formData.append('password', createForm.password);
      formData.append('role', createForm.role);
      formData.append('status', createForm.status);
      formData.append('phone', createForm.phone);
      formData.append('about', createForm.about);
      formData.append('headline', createForm.headline);
      formData.append('linkedin', createForm.linkedin);
      formData.append('github', createForm.github);
      formData.append('socialLinks', JSON.stringify(createForm.socialLinks));
      formData.append('companyName', createForm.companyName);
      formData.append('companyLogo', createForm.companyLogo);
      formData.append('industry', createForm.industry);
      formData.append('location', createForm.location);
      formData.append('description', createForm.description);
      formData.append('companyDescription', createForm.companyDescription);
      formData.append('website', createForm.website);
      formData.append('skills', JSON.stringify(createForm.skills));
      formData.append('cv', createForm.cv);
      formData.append('permissions', JSON.stringify(createForm.permissions));
      formData.append('department', createForm.department);
      
      if (createForm.profilePicture instanceof File) {
        formData.append('profilePicture', createForm.profilePicture);
      }

      await createUser(formData);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  const filteredUsers = users.filter(user => {
    if (roleFilter === "all") return true;
    return user.role === roleFilter;
  });

  const UserConnections = ({ userId }) => {
    const { data: connectionsData, isLoading: connectionsLoading } = useQuery({
      queryKey: ["userConnections", userId],
      queryFn: async () => {
        const response = await axiosInstance.get(`/connections/user/${userId}`);
        return response.data.data;
      },
      enabled: !!userId,
    });

    if (connectionsLoading) {
      return <p className="text-sm text-gray-500 text-center py-2">Chargement...</p>;
    }

    const connections = connectionsData || [];

    if (connections.length === 0) {
      return <p className="text-sm text-gray-500 text-center py-2">Aucune connexion</p>;
    }

    return (
      <div className="space-y-2">
        {connections.map((connection) => (
          <div key={connection._id} className="flex items-center justify-between p-1 hover:bg-gray-50 rounded group">
            <div className="flex items-center space-x-2">
              <img
                src={connection.profilePicture || "/avatar.png"}
                alt={connection.name}
                className="w-6 h-6 rounded-full"
              />
              <div className="text-sm">
                <span className="font-medium">{connection.name}</span>
                {connection.headline && (
                  <span className="text-gray-500 text-xs block">{connection.headline}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm(`Êtes-vous sûr de vouloir supprimer la connexion avec ${connection.name} ?`)) {
                  deleteConnection(connection._id);
                }
              }}
              className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Supprimer la connexion"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const validatePassword = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  useEffect(() => {
    setCreatePasswordMatch(createForm.password === createForm.confirmPassword);
    setCreatePasswordStrength(validatePassword(createForm.password));
  }, [createForm.password, createForm.confirmPassword]);

  useEffect(() => {
    setPasswordMatch(passwordForm.password === passwordForm.confirmPassword);
  }, [passwordForm.password, passwordForm.confirmPassword]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-400/20 to-emerald-400/20 animate-pulse"></div>
          </div>
          <div>
            <p className="text-gray-700 text-lg font-semibold">Chargement des données...</p>
            <p className="text-gray-500 text-sm mt-1">Veuillez patienter un instant</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <p className="text-red-500 text-lg">Une erreur est survenue lors du chargement des utilisateurs</p>
          <p className="text-gray-600 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header avec effet glassmorphism */}
      <header className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-green-100/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-700">
                Gestion des Utilisateurs
              </h1>
              <p className="text-gray-600 font-medium">Administration des comptes utilisateurs</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Section titre avec indicateur */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-800">Liste des utilisateurs</h2>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            {/* Filtre par rôle */}
            <div className="flex items-center space-x-2">
              <label htmlFor="roleFilter" className="text-sm font-medium text-gray-700">
                Filtre:
              </label>
              <select
                id="roleFilter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white/90 backdrop-blur-sm shadow border border-green-100/50"
              >
                <option value="all">Tous les rôles</option>
                <option value="user">Utilisateur</option>
                <option value="recruteur">Recruteur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvel utilisateur
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border border-green-100/50 overflow-hidden hover:shadow-3xl transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-100/50">
              <thead className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Email Educatif
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-100/50">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-all duration-300">
                      {editingUser === user._id ? (
                        <td colSpan="6" className="px-6 py-4">
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
                              <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Modifier l'utilisateur</h2>
                                    <p className="mt-1 text-sm text-gray-500">Modifiez les informations de l'utilisateur</p>
                                  </div>
                                  <button
                                    onClick={() => setEditingUser(null)}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                  >
                                    <X className="w-6 h-6" />
                                  </button>
                                </div>
                              </div>
                              <form onSubmit={handleSubmit} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom complet <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Professionnelle</label>
                                      <input
                                        type="email"
                                        value={editForm.emailEdu}
                                        onChange={(e) => setEditForm({ ...editForm, emailEdu: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                                        required
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                                      <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                                      >
                                        <option value="user">Utilisateur</option>
                                        <option value="recruteur">Recruteur</option>
                                        <option value="admin">Administrateur</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                                      <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                                      >
                                        <option value="active">Actif</option>
                                        <option value="pending">En attente</option>
                                        <option value="rejected">Rejeté</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Connexions</label>
                                      <UserConnections userId={user._id} />
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Photo de profil */}
                                <div className="mt-6">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Photo de profil
                                  </label>
                                  <div className="flex items-center space-x-4">
                                    <div className="relative">
                                      <img
                                        src={editForm.profilePicture ? URL.createObjectURL(editForm.profilePicture) : (user.profilePicture || "/avatar.png")}
                                        alt="Photo de profil"
                                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                                      />
                                      {editForm.profilePicture && (
                                        <button
                                          type="button"
                                          onClick={() => setEditForm({ ...editForm, profilePicture: null })}
                                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          if (file) {
                                            if (file.size > 5 * 1024 * 1024) {
                                              toast.error("L'image ne doit pas dépasser 5MB");
                                              return;
                                            }
                                            setEditForm({ ...editForm, profilePicture: file });
                                          }
                                        }}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                        Formats acceptés : JPG, PNG, GIF. Taille max : 5MB
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-8 flex justify-end space-x-3">
                                  <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-6 py-2.5 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-sm font-medium text-white rounded-lg hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                  >
                                    Enregistrer
                                  </button>
                                </div>
                              </form>
                            </div>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={user.profilePicture || "/avatar.png"}
                                  alt={user.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">@{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.emailEdu}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === "recruteur"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.role === "admin"
                                ? "Administrateur"
                                : user.role === "recruteur"
                                ? "Recruteur"
                                : "Utilisateur"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : user.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.status === "active"
                                ? "Actif"
                                : user.status === "pending"
                                ? "En attente"
                                : "Rejeté"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex items-center justify-center space-x-4">
                              <button
                                onClick={() => handleEdit(user)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Lock size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
                                    deleteUser(user._id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal de changement de mot de passe */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Changer le mot de passe</h2>
                  <p className="mt-1 text-sm text-gray-500">Pour {selectedUser.name}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${
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
                  onClick={() => setSelectedUser(null)}
                  className="px-6 py-2.5 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-sm font-medium text-white rounded-lg hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de création d'utilisateur */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Créer un nouvel utilisateur</h2>
                  <p className="mt-1 text-sm text-gray-500">Remplissez les informations de l'utilisateur</p>
                </div>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <form id="createUserForm" onSubmit={handleCreateSubmit} className="p-6">
                <div className="space-y-6">
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mot de passe *
                        </label>
                        <div className="relative">
                          <input
                            type={showCreatePassword ? "text" : "password"}
                            value={createForm.password}
                            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCreatePassword(!showCreatePassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                          >
                            {showCreatePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {createForm.password && (
                          <div className="mt-2">
                            <div className="flex space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-1 flex-1 rounded ${
                                    i < createPasswordStrength
                                      ? createPasswordStrength <= 2
                                        ? "bg-red-500"
                                        : createPasswordStrength <= 3
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                      : "bg-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className={`text-xs mt-1 ${
                              createPasswordStrength <= 2
                                ? "text-red-600"
                                : createPasswordStrength <= 3
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}>
                              {createPasswordStrength <= 2
                                ? "Faible"
                                : createPasswordStrength <= 3
                                ? "Moyen"
                                : "Fort"}
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmer le mot de passe *
                        </label>
                        <div className="relative">
                          <input
                            type={showCreateConfirmPassword ? "text" : "password"}
                            value={createForm.confirmPassword}
                            onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${
                              createForm.confirmPassword
                                ? createPasswordMatch
                                  ? "border-green-300"
                                  : "border-red-300"
                                : "border-gray-300"
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCreateConfirmPassword(!showCreateConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                          >
                            {showCreateConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {createForm.confirmPassword && !createPasswordMatch && (
                          <p className="text-red-600 text-sm mt-1">Les mots de passe ne correspondent pas</p>
                        )}
                        {createForm.confirmPassword && createPasswordMatch && (
                          <p className="text-green-600 text-sm mt-1">Les mots de passe correspondent</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Photo de profil pour tous les utilisateurs */}
                  <div className="bg-green-50/50 p-4 rounded-lg border border-green-100/50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Photo de profil</h3>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={createForm.profilePicture ? URL.createObjectURL(createForm.profilePicture) : "/avatar.png"}
                          alt="Photo de profil"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                        />
                        {createForm.profilePicture && (
                          <button
                            type="button"
                            onClick={() => setCreateForm({ ...createForm, profilePicture: null })}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                toast.error("L'image ne doit pas dépasser 5MB");
                                return;
                              }
                              setCreateForm({ ...createForm, profilePicture: file });
                            }
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Formats acceptés : JPG, PNG, GIF. Taille max : 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Champs spécifiques selon le rôle */}
                  {createForm.role === "recruteur" && (
                    <>
                      {/* Informations de l'entreprise */}
                      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100/50">
                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Informations de l'entreprise</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nom de l'entreprise *
                            </label>
                            <input
                              type="text"
                              value={createForm.companyName}
                              onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Logo de l'entreprise
                            </label>
                            <input
                              type="url"
                              value={createForm.companyLogo}
                              onChange={(e) => setCreateForm({ ...createForm, companyLogo: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                              placeholder="https://example.com/logo.png"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Secteur d'activité *
                            </label>
                            <select
                              value={createForm.industry}
                              onChange={(e) => setCreateForm({ ...createForm, industry: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                              required
                            >
                              <option value="">Sélectionner un secteur</option>
                              <option value="technology">Technologie</option>
                              <option value="healthcare">Santé</option>
                              <option value="finance">Finance</option>
                              <option value="education">Éducation</option>
                              <option value="manufacturing">Industrie</option>
                              <option value="retail">Commerce</option>
                              <option value="consulting">Conseil</option>
                              <option value="marketing">Marketing</option>
                              <option value="design">Design</option>
                              <option value="sales">Ventes</option>
                              <option value="hr">Ressources Humaines</option>
                              <option value="legal">Juridique</option>
                              <option value="other">Autre</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Localisation *
                            </label>
                            <input
                              type="text"
                              value={createForm.location}
                              onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                              placeholder="Ville, Pays"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Site web
                          </label>
                          <input
                            type="url"
                            value={createForm.website}
                            onChange={(e) => setCreateForm({ ...createForm, website: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                            placeholder="https://www.example.com"
                          />
                        </div>
                      </div>

                      {/* Descriptions */}
                      <div className="bg-green-50/50 p-4 rounded-lg border border-green-100/50">
                        <h3 className="text-lg font-semibold text-green-800 mb-3">Descriptions</h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description de l'entreprise *
                          </label>
                          <textarea
                            value={createForm.description}
                            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                            placeholder="Décrivez votre entreprise, sa mission, ses valeurs..."
                            required
                          />
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description complète
                          </label>
                          <textarea
                            value={createForm.companyDescription}
                            onChange={(e) => setCreateForm({ ...createForm, companyDescription: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                            placeholder="Description détaillée de l'entreprise, son histoire, ses réalisations..."
                          />
                        </div>
                      </div>

                      {/* Informations de contact professionnel */}
                      <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100/50">
                        <h3 className="text-lg font-semibold text-purple-800 mb-3">Contact professionnel</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Téléphone professionnel
                            </label>
                            <input
                              type="tel"
                              value={createForm.phone}
                              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                              placeholder="+33 1 23 45 67 89"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Titre professionnel
                            </label>
                            <input
                              type="text"
                              value={createForm.headline}
                              onChange={(e) => setCreateForm({ ...createForm, headline: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                              placeholder="ex: Responsable RH, Directeur Commercial..."
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            À propos du recruteur
                          </label>
                          <textarea
                            value={createForm.about}
                            onChange={(e) => setCreateForm({ ...createForm, about: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                            placeholder="Présentez-vous en tant que recruteur..."
                          />
                        </div>
                      </div>

                      {/* Réseaux sociaux professionnels */}
                      <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100/50">
                        <h3 className="text-lg font-semibold text-orange-800 mb-3">Réseaux sociaux professionnels</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              LinkedIn
                            </label>
                            <input
                              type="url"
                              value={createForm.linkedin}
                              onChange={(e) => setCreateForm({ ...createForm, linkedin: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                              placeholder="https://linkedin.com/in/username"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              GitHub
                            </label>
                            <input
                              type="url"
                              value={createForm.github}
                              onChange={(e) => setCreateForm({ ...createForm, github: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                              placeholder="https://github.com/username"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Twitter
                            </label>
                            <input
                              type="url"
                              value={createForm.socialLinks.twitter}
                              onChange={(e) => setCreateForm({ 
                                ...createForm, 
                                socialLinks: { ...createForm.socialLinks, twitter: e.target.value }
                              })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                              placeholder="https://twitter.com/username"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Facebook
                            </label>
                            <input
                              type="url"
                              value={createForm.socialLinks.facebook}
                              onChange={(e) => setCreateForm({ 
                                ...createForm, 
                                socialLinks: { ...createForm.socialLinks, facebook: e.target.value }
                              })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                              placeholder="https://facebook.com/username"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {createForm.role === "user" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value={createForm.phone}
                          onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                          placeholder="+33 1 23 45 67 89"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Titre professionnel
                        </label>
                        <input
                          type="text"
                          value={createForm.headline}
                          onChange={(e) => setCreateForm({ ...createForm, headline: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                          placeholder="ex: Développeur Full Stack"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          À propos
                        </label>
                        <textarea
                          value={createForm.about}
                          onChange={(e) => setCreateForm({ ...createForm, about: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                          placeholder="Parlez-nous de vous..."
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            LinkedIn
                          </label>
                          <input
                            type="url"
                            value={createForm.linkedin}
                            onChange={(e) => setCreateForm({ ...createForm, linkedin: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                            placeholder="https://linkedin.com/in/username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            GitHub
                          </label>
                          <input
                            type="url"
                            value={createForm.github}
                            onChange={(e) => setCreateForm({ ...createForm, github: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                            placeholder="https://github.com/username"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Twitter
                          </label>
                          <input
                            type="url"
                            value={createForm.socialLinks.twitter}
                            onChange={(e) => setCreateForm({ 
                              ...createForm, 
                              socialLinks: { ...createForm.socialLinks, twitter: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                            placeholder="https://twitter.com/username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Facebook
                          </label>
                          <input
                            type="url"
                            value={createForm.socialLinks.facebook}
                            onChange={(e) => setCreateForm({ 
                              ...createForm, 
                              socialLinks: { ...createForm.socialLinks, facebook: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                            placeholder="https://facebook.com/username"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {createForm.role === "admin" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Département
                        </label>
                        <select
                          value={createForm.department}
                          onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                        >
                          <option value="">Sélectionner un département</option>
                          <option value="technical">Technique</option>
                          <option value="marketing">Marketing</option>
                          <option value="sales">Ventes</option>
                          <option value="hr">Ressources Humaines</option>
                          <option value="finance">Finance</option>
                          <option value="operations">Opérations</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rôle *
                      </label>
                      <select
                        value={createForm.role}
                        onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                      >
                        <option value="user">Utilisateur</option>
                        <option value="recruteur">Recruteur</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Statut *
                      </label>
                      <select
                        value={createForm.status}
                        onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                      >
                        <option value="active">Actif</option>
                        <option value="pending">En attente</option>
                        <option value="rejected">Rejeté</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-6 py-2.5 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!createPasswordMatch || createPasswordStrength < 3}
                    className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 ${
                      !createPasswordMatch || createPasswordStrength < 3
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    }`}
                  >
                    Créer l'utilisateur
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagementPage;


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import { Edit, Trash2, Lock, Plus, Eye, EyeOff, Users, X, LayoutDashboard, Building2, FileText } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { invalidateConnectionQueries } from "../../utils/queryUtils";

const AdminNavbar = () => {
	const location = useLocation();
	// const navItems = [
	// 	{ name: "Tableau de bord", path: "/admin", icon: LayoutDashboard },
	// 	{ name: "Utilisateurs", path: "/admin/users", icon: Users },
	// 	{ name: "Recruteurs", path: "/admin/recruiters", icon: Building2 },
	// 	{ name: "Posts", path: "/admin/posts", icon: FileText },
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
	});
	const [createForm, setCreateForm] = useState({
		name: "",
		emailEdu: "",
		emailPersonelle: "",
		username: "",
		password: "",
		role: "user",
		status: "active",
		companyName: "",
		industry: "",
		location: "",
		companySize: "",
		companyDescription: "",
	});
	const [passwordForm, setPasswordForm] = useState({
		password: "",
		confirmPassword: "",
	});
	const [passwordMatch, setPasswordMatch] = useState(true);

	const queryClient = useQueryClient();

	const { data: usersData, isLoading, error } = useQuery({
		queryKey: ["usersWithConnections"],
		queryFn: async () => {
			try {
				const response = await axiosInstance.get("/admin/users");
				console.log("Réponse du serveur:", response.data);
				return response.data;
			} catch (error) {
				console.error("Erreur lors de la récupération des utilisateurs:", error);
				throw new Error(error.response?.data?.message || "Une erreur est survenue lors du chargement des utilisateurs");
			}
		},
		staleTime: 1000 * 60 * 5, // Cache pour 5 minutes
		cacheTime: 1000 * 60 * 30, // Garde en cache pendant 30 minutes
		retry: 3, // Réessaie 3 fois en cas d'échec
		refetchOnWindowFocus: true, // Rafraîchit les données quand la fenêtre regagne le focus
	});

	console.log("Données des utilisateurs:", usersData);
	const users = usersData || [];
	console.log("Liste des utilisateurs:", users);

	const { mutate: updateUser } = useMutation({
		mutationFn: (userData) => {
			const { _id, ...updateData } = userData;
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
		mutationFn: (userData) => axiosInstance.post("/admin/users", userData),
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
				role: "user",
				status: "active",
				companyName: "",
				industry: "",
				location: "",
				companySize: "",
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
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		updateUser({ _id: editingUser, name: editForm.name, emailEdu: editForm.emailEdu, emailPersonelle: editForm.emailPersonelle, role: editForm.role, status: editForm.status });
	};

	const handleCreateSubmit = (e) => {
		e.preventDefault();
		createUser(createForm);
	};

	// Filtrer les utilisateurs en fonction du rôle sélectionné
	const filteredUsers = users.filter(user => {
		if (roleFilter === "all") return true;
		return user.role === roleFilter;
	});

	// Composant pour afficher les connexions d'un utilisateur
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

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
					<p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<p className="text-red-500 text-lg">Une erreur est survenue lors du chargement des utilisateurs</p>
					<p className="text-gray-600 mt-2">{error.message}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 pt-16">
			<AdminNavbar />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs test</h1>
					<div className="flex items-center space-x-4">
						{/* Filtre par rôle */}
						<div className="flex items-center space-x-2">
							<label htmlFor="roleFilter" className="text-sm font-medium text-gray-700">
								Filtrer par rôle:
							</label>
							<select
								id="roleFilter"
								value={roleFilter}
								onChange={(e) => setRoleFilter(e.target.value)}
								className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
							>
								<option value="all">Tous les rôles</option>
								<option value="user">Utilisateur</option>
								<option value="recruteur">Recruteur</option>
								<option value="admin">Administrateur</option>
							</select>
						</div>
						<button
							onClick={() => setIsCreating(true)}
							className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
						>
							<Plus className="h-5 w-5 mr-2" />
							Nouvel utilisateur
						</button>
					</div>
				</div>

				<div className="bg-white shadow rounded-lg overflow-hidden">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Nom
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Email Educatif
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Rôle
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
							{filteredUsers.length > 0 ? (
								filteredUsers.map((user) => (
									<tr key={user._id}>
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
																	<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
																	</svg>
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
																	className="px-6 py-2.5 bg-green-600 text-sm font-medium text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
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
									<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
									</svg>
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
									className="px-6 py-2.5 bg-green-600 text-sm font-medium text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
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
					<div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl">
						<div className="p-6 border-b border-gray-200">
							<div className="flex justify-between items-center">
								<div>
									<h2 className="text-2xl font-bold text-gray-900">Créer un nouvel utilisateur</h2>
									<p className="mt-1 text-sm text-gray-500">Remplissez les informations de l'utilisateur</p>
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
								</div>
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Mot de passe <span className="text-red-500">*</span>
										</label>
										<div className="relative">
											<input
												type={showPassword ? "text" : "password"}
												value={createForm.password}
												onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
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
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Rôle <span className="text-red-500">*</span>
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
											Statut <span className="text-red-500">*</span>
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

							{/* Champs spécifiques aux recruteurs */}
							{createForm.role === "recruteur" && (
								<div className="mt-6 border-t border-gray-200 pt-6">
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
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
													required={createForm.role === "recruteur"}
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Secteur d'activité <span className="text-red-500">*</span>
												</label>
												<select
													value={createForm.industry}
													onChange={(e) => setCreateForm({ ...createForm, industry: e.target.value })}
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
													required={createForm.role === "recruteur"}
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
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Localisation <span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													value={createForm.location}
													onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
													placeholder="Ville, Pays"
													required={createForm.role === "recruteur"}
												/>
											</div>
										</div>
										<div className="space-y-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Taille de l'entreprise <span className="text-red-500">*</span>
												</label>
												<select
													value={createForm.companySize}
													onChange={(e) => setCreateForm({ ...createForm, companySize: e.target.value })}
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
													required={createForm.role === "recruteur"}
												>
													<option value="">Sélectionnez une taille</option>
													<option value="1-10">1-10 employés</option>
													<option value="11-50">11-50 employés</option>
													<option value="51-200">51-200 employés</option>
													<option value="201-500">201-500 employés</option>
													<option value="501-1000">501-1000 employés</option>
													<option value="1000+">Plus de 1000 employés</option>
												</select>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Description de l'entreprise <span className="text-red-500">*</span>
												</label>
												<textarea
													value={createForm.companyDescription}
													onChange={(e) => setCreateForm({ ...createForm, companyDescription: e.target.value })}
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
													rows="4"
													placeholder="Décrivez brièvement votre entreprise..."
													required={createForm.role === "recruteur"}
												/>
											</div>
										</div>
									</div>
								</div>
							)}

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
									className="px-6 py-2.5 bg-green-600 text-sm font-medium text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
								>
									Créer
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default UsersManagementPage; 
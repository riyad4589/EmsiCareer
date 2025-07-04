import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";

const PostsManagementPage = () => {
	const [editingPost, setEditingPost] = useState(null);
	const [editForm, setEditForm] = useState({
		content: "",
		visibility: "public"
	});

	const queryClient = useQueryClient();

	const { data: postsData, isLoading, error } = useQuery({
		queryKey: ["adminPosts"],
		queryFn: async () => {
			try {
				const response = await axiosInstance.get("/admin/posts");
				return response.data;
			} catch (error) {
				console.error("Erreur lors de la récupération des posts:", error);
				throw new Error(error.response?.data?.message || "Une erreur est survenue lors du chargement des posts");
			}
		},
		staleTime: 1000 * 60 * 5,
		cacheTime: 1000 * 60 * 30,
		retry: 3,
		refetchOnWindowFocus: true,
	});

	const { mutate: updatePost } = useMutation({
		mutationFn: (postData) => {
			const { _id, ...updateData } = postData;
			return axiosInstance.put(`/admin/posts/${_id}`, updateData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["adminPosts"]);
			toast.success("Post mis à jour avec succès");
			setEditingPost(null);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
		},
	});

	const { mutate: deletePost } = useMutation({
		mutationFn: (postId) => axiosInstance.delete(`/admin/posts/${postId}`),
		onSuccess: (_, postId) => {
			// Mettre à jour le cache optimistiquement
			queryClient.setQueryData(["adminPosts"], (oldData) => {
				return oldData.filter(post => post._id !== postId);
			});
			toast.success("Post supprimé avec succès");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Erreur lors de la suppression");
			// Recharger les données en cas d'erreur
			queryClient.invalidateQueries(["adminPosts"]);
		},
	});

	const handleEdit = (post) => {
		setEditingPost(post);
		setEditForm({
			content: post.content,
			visibility: post.visibility || "public"
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		updatePost({
			_id: editingPost._id,
			...editForm
		});
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
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
			<div className="bg-white rounded-lg shadow-md overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-800">Gestion des Posts</h2>
				</div>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Auteur
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Contenu
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Date
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Visibilité
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{postsData && postsData.length > 0 ? (
								postsData.map((post) => (
									<tr key={post._id}>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 h-10 w-10">
													<img
														className="h-10 w-10 rounded-full"
														src={post.author.profilePicture || "https://via.placeholder.com/40"}
														alt={post.author.name}
													/>
												</div>
												<div className="ml-4">
													<div className="text-sm font-medium text-gray-900">
														{post.author.name}
													</div>
													<div className="text-sm text-gray-500">
														{post.author.email}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-900 max-w-md truncate">
												{post.content}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{new Date(post.createdAt).toLocaleDateString()}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
												post.visibility === "public" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
											}`}>
												{post.visibility === "public" ? "Public" : "Privé"}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex items-center justify-end space-x-4">
												<button
													onClick={() => handleEdit(post)}
													className="text-green-600 hover:text-green-900"
												>
													<Edit size={18} />
												</button>
												<button
													onClick={() => {
														if (window.confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) {
															deletePost(post._id);
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
									<td colSpan="5" className="px-6 py-4 text-center text-gray-500">
										Aucun post trouvé
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal de modification de post */}
			{editingPost && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg p-6 w-full max-w-2xl">
						<h3 className="text-lg font-semibold mb-4">Modifier le post</h3>
						<form onSubmit={handleSubmit}>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Contenu
								</label>
								<textarea
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
									rows="4"
									value={editForm.content}
									onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
									required
								/>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Visibilité
								</label>
								<select
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
									value={editForm.visibility}
									onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value })}
								>
									<option value="public">Public</option>
									<option value="private">Privé</option>
								</select>
							</div>
							<div className="flex justify-end space-x-4">
								<button
									type="button"
									onClick={() => setEditingPost(null)}
									className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
								>
									Annuler
								</button>
								<button
									type="submit"
									className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
								>
									Enregistrer
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default PostsManagementPage; 
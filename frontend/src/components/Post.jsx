import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { Loader, MessageCircle, Send, Share2, ThumbsUp, Trash2, MoreVertical, Briefcase, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

import PostAction from "./PostAction";

const Post = ({ post }) => {
	const { postId } = useParams();

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const [showComments, setShowComments] = useState(false);
	const [newComment, setNewComment] = useState("");
	const [comments, setComments] = useState(post.comments || []);
	const [showOptions, setShowOptions] = useState(false);
	const [showApplyModal, setShowApplyModal] = useState(false);
	const [cv, setCv] = useState("");
	const [lettreMotivation, setLettreMotivation] = useState("");
	const isOwner = authUser?._id === post.author?._id;
	const isLiked = post.likes?.includes(authUser?._id) || false;
	
	// Détecter si c'est une offre d'emploi
	const isOffre = post.titre && post.localisation && post.typeContrat;
	const hasApplied = post.candidatures?.some(candidature => candidature.laureat === authUser?._id);

	const queryClient = useQueryClient();

	const { mutate: deletePost, isPending: isDeletingPost } = useMutation({
		mutationFn: async () => {
			await axiosInstance.delete(`/posts/delete/${post._id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast.success("Publication supprimée avec succès");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Une erreur est survenue");
		},
	});

	const { mutate: createComment, isPending: isAddingComment } = useMutation({
		mutationFn: async (newComment) => {
			await axiosInstance.post(`/posts/${post._id}/comment`, { content: newComment });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast.success("Commentaire ajouté avec succès");
		},
		onError: (err) => {
			toast.error(err.response?.data?.message || "Une erreur est survenue");
		},
	});

	const { mutate: likePost, isPending: isLikingPost } = useMutation({
		mutationFn: async () => {
			await axiosInstance.post(`/posts/${post._id}/like`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["post", postId] });
		},
		onError: (err) => {
			toast.error(err.response?.data?.message || "Une erreur est survenue");
		},
	});

	const { mutate: applyToJob, isPending: isApplying } = useMutation({
		mutationFn: async () => {
			// Utiliser l'endpoint approprié selon le type
			const endpoint = isOffre ? `/offres/${post._id}/apply` : `/posts/${post._id}/apply`;
			await axiosInstance.post(endpoint, {
				cv,
				lettreMotivation
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast.success("Candidature envoyée avec succès !");
			setShowApplyModal(false);
			setCv("");
			setLettreMotivation("");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Une erreur est survenue");
		},
	});

	const handleDeletePost = () => {
		if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette publication ?")) return;
		deletePost();
	};

	const handleLikePost = async () => {
		if (isLikingPost) return;
		likePost();
	};

	const handleAddComment = async (e) => {
		e.preventDefault();
		if (!newComment.trim()) {
			toast.error("Le commentaire ne peut pas être vide");
			return;
		}
		createComment(newComment);
		setNewComment("");
		setComments([
			...comments,
			{
				content: newComment,
				user: {
					_id: authUser._id,
					name: authUser.name,
					profilePicture: authUser.profilePicture,
				},
				createdAt: new Date(),
			},
		]);
	};

	const handleShare = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			toast.success("Lien copié dans le presse-papiers");
		} catch (err) {
			toast.error("Impossible de copier le lien");
		}
	};

	const handleApplyToJob = (e) => {
		e.preventDefault();
		if (!cv.trim() && !lettreMotivation.trim()) {
			toast.error("Veuillez fournir au moins un CV ou une lettre de motivation");
			return;
		}
		applyToJob();
	};

	return (
		<>
			<div className='bg-secondary rounded-lg shadow mb-4'>
				<div className='p-4'>
					<div className='flex items-center justify-between mb-4'>
						<div className='flex items-center'>
							<Link to={`/profile/${post?.author?.username}`} className="group">
								<div className="relative">
									<img
										src={post.author?.profilePicture || "/avatar.png"}
										alt={post.author?.name || "Utilisateur"}
										className='size-10 rounded-full mr-3 object-cover border-2 border-transparent group-hover:border-success transition-colors duration-200'
									/>
									<div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
										<span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-medium">
											Voir le profil
										</span>
									</div>
								</div>
							</Link>

							<div>
								<Link 
									to={`/profile/${post?.author?.username}`}
									className='font-semibold hover:text-success transition-colors duration-200'
								>
									{post.author?.name || "Utilisateur inconnu"}
								</Link>
								<p className='text-xs text-info'>{post.author?.headline || ""}</p>
								<p className='text-xs text-info'>
									{formatDistanceToNow(new Date(post.createdAt), { 
										addSuffix: true,
										locale: fr 
									})}
								</p>
							</div>
						</div>
						<div className="relative">
							<button 
								onClick={() => setShowOptions(!showOptions)}
								className='text-info hover:text-success transition-colors duration-200'
							>
								<MoreVertical size={18} />
							</button>
							{showOptions && (
								<div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-lg shadow-lg py-1 z-10">
									{isOwner && (
										<button 
											onClick={handleDeletePost} 
											className='w-full text-left px-4 py-2 text-red-500 hover:bg-base-200 transition-colors duration-200 flex items-center gap-2'
										>
											{isDeletingPost ? (
												<>
													<Loader size={16} className='animate-spin' />
													<span>Suppression...</span>
												</>
											) : (
												<>
													<Trash2 size={16} />
													<span>Supprimer</span>
												</>
											)}
										</button>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Affichage des détails de l'offre d'emploi */}
					{isOffre && (
						<div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
							<div className="flex items-center gap-2 mb-2">
								<Briefcase size={20} className="text-green-600" />
								<h3 className="font-semibold text-green-800">{post.titre}</h3>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
								<div>
									<span className="font-medium text-gray-700">Localisation :</span>
									<span className="ml-2 text-gray-600">{post.localisation}</span>
								</div>
								<div>
									<span className="font-medium text-gray-700">Type de contrat :</span>
									<span className="ml-2 text-gray-600">{post.typeContrat}</span>
								</div>
								{post.competencesRequises?.length > 0 && (
									<div className="md:col-span-2">
										<span className="font-medium text-gray-700">Compétences requises :</span>
										<div className="flex flex-wrap gap-1 mt-1">
											{post.competencesRequises.map((comp, index) => (
												<span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
													{comp}
												</span>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Contenu du post/offre */}
					<p className='mb-4 whitespace-pre-wrap'>{isOffre ? post.description : post.content}</p>
					{post.image && (
						<div className="mb-4">
							<img 
								src={post.image} 
								alt='Contenu de la publication' 
								className='rounded-lg w-full max-h-[500px] object-contain'
							/>
						</div>
					)}

					<div className='flex justify-between text-info'>
						<PostAction
							icon={<ThumbsUp size={18} className={isLiked ? "text-green-500 fill-green-500" : ""} />}
							text={`J'aime (${post.likes?.length || 0})`}
							onClick={handleLikePost}
							disabled={isLikingPost}
						/>

						<PostAction
							icon={<MessageCircle size={18} />}
							text={`Commentaires (${comments.length})`}
							onClick={() => setShowComments(!showComments)}
						/>

						{/* Bouton Postuler pour les offres d'emploi */}
						{isOffre && !isOwner && post.author?.role === "recruteur" && (
							<PostAction
								icon={<Briefcase size={18} />}
								text={hasApplied ? "Déjà postulé" : "Postuler"}
								onClick={() => !hasApplied && setShowApplyModal(true)}
								disabled={hasApplied}
								className={hasApplied ? "text-green-600" : ""}
							/>
						)}

						<PostAction 
							icon={<Share2 size={18} />} 
							text='Partager' 
							onClick={handleShare}
						/>
					</div>
				</div>

				{showComments && (
					<div className='px-4 pb-4'>
						<div className='mb-4 max-h-60 overflow-y-auto space-y-3'>
							{comments.length > 0 ? (
								comments.map((comment) => (
									<div key={comment._id} className='bg-base-100 p-3 rounded-lg flex items-start gap-3'>
										<Link to={`/profile/${comment.user?.username}`} className="flex-shrink-0">
											<img
												src={comment.user?.profilePicture || "/avatar.png"}
												alt={comment.user?.name || "Utilisateur"}
												className='w-8 h-8 rounded-full object-cover border-2 border-transparent hover:border-success transition-colors duration-200'
											/>
										</Link>
										<div className='flex-grow'>
											<div className='flex items-center gap-2 mb-1'>
												<Link 
													to={`/profile/${comment.user?.username}`}
													className='font-semibold hover:text-success transition-colors duration-200'
												>
													{comment.user?.name || "Utilisateur inconnu"}
												</Link>
												<span className='text-xs text-info'>
													{formatDistanceToNow(new Date(comment.createdAt), { 
														addSuffix: true,
														locale: fr 
													})}
												</span>
											</div>
											<p className="text-info">{comment.content}</p>
										</div>
									</div>
								))
							) : (
								<p className="text-center text-info py-4">Aucun commentaire pour le moment</p>
							)}
						</div>

						<form onSubmit={handleAddComment} className='flex items-center gap-2'>
							<input
								type='text'
								value={newComment}
								onChange={(e) => setNewComment(e.target.value)}
								placeholder='Ajouter un commentaire...'
								className='flex-grow p-2 rounded-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-success'
								maxLength={500}
							/>

							<button
								type='submit'
								className='bg-success text-white p-2 rounded-full hover:bg-success-dark transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
								disabled={isAddingComment || !newComment.trim()}
							>
								{isAddingComment ? (
									<Loader size={18} className='animate-spin' />
								) : (
									<Send size={18} />
								)}
							</button>
						</form>
					</div>
				)}
			</div>

			{/* Modal de candidature */}
			{showApplyModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-semibold">Postuler à l'offre</h2>
								<button
									onClick={() => setShowApplyModal(false)}
									className="text-gray-500 hover:text-gray-700"
								>
									<X size={24} />
								</button>
							</div>

							<form onSubmit={handleApplyToJob} className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										CV (optionnel)
									</label>
									<textarea
										value={cv}
										onChange={(e) => setCv(e.target.value)}
										placeholder="Collez votre CV ou décrivez votre expérience..."
										className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										rows={4}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Lettre de motivation (optionnel)
									</label>
									<textarea
										value={lettreMotivation}
										onChange={(e) => setLettreMotivation(e.target.value)}
										placeholder="Expliquez pourquoi vous êtes intéressé par ce poste..."
										className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										rows={4}
									/>
								</div>

								<div className="flex gap-3 pt-4">
									<button
										type="button"
										onClick={() => setShowApplyModal(false)}
										className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
									>
										Annuler
									</button>
									<button
										type="submit"
										disabled={isApplying || (!cv.trim() && !lettreMotivation.trim())}
										className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									>
										{isApplying ? (
											<>
												<Loader size={16} className="animate-spin mr-2" />
												Envoi...
											</>
										) : (
											"Envoyer ma candidature"
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default Post;

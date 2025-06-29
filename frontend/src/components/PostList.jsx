import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { useState } from "react";

const PostList = ({ posts }) => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [commentContent, setCommentContent] = useState({});
	const [showComments, setShowComments] = useState({});

	const likeMutation = useMutation({
		mutationFn: async (postId) => {
			const response = await axiosInstance.post(`/posts/${postId}/like`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["posts"]);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Erreur lors du like");
		},
	});

	const commentMutation = useMutation({
		mutationFn: async ({ postId, content }) => {
			const response = await axiosInstance.post(`/posts/${postId}/comment`, { content });
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["posts"]);
			setCommentContent({});
		},
		onError: (error) => {
			console.error("Erreur lors de l'ajout du commentaire:", error);
			toast.error(error.response?.data?.message || "Erreur lors de l'ajout du commentaire");
		},
	});

	const handleComment = (postId) => {
		if (!commentContent[postId]?.trim()) {
			toast.error("Le commentaire ne peut pas être vide");
			return;
		}

		commentMutation.mutate({
			postId,
			content: commentContent[postId],
		});
	};

	const toggleComments = (postId) => {
		setShowComments((prev) => ({
			...prev,
			[postId]: !prev[postId],
		}));
	};

	if (!posts?.data || posts.data.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-600">Aucun post pour le moment</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{posts.data.map((post) => (
				<div key={post._id} className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center space-x-4 mb-4">
						<img
							src={post.author.profilePicture || "/default-avatar.png"}
							alt={post.author.name}
							className="w-12 h-12 rounded-full"
						/>
						<div>
							<h3 className="font-medium">{post.author.name}</h3>
							<p className="text-sm text-gray-500">
								{formatDistanceToNow(new Date(post.createdAt), {
									addSuffix: true,
									locale: fr,
								})}
							</p>
						</div>
					</div>
					<p className="text-gray-800 mb-4">{post.content}</p>
					{post.image && (
						<img
							src={post.image}
							alt="Post content"
							className="w-full rounded-lg mb-4"
						/>
					)}
					<div className="flex items-center space-x-6 text-gray-500">
						<button
							onClick={() => likeMutation.mutate(post._id)}
							className={`flex items-center space-x-2 ${
								post.likes.includes(user?._id)
									? "text-red-500"
									: "hover:text-red-500"
							}`}
						>
							<Heart
								size={20}
								fill={post.likes.includes(user?._id) ? "currentColor" : "none"}
							/>
							<span>{post.likes.length}</span>
						</button>
						<button
							onClick={() => toggleComments(post._id)}
							className="flex items-center space-x-2 hover:text-blue-500"
						>
							<MessageCircle size={20} />
							<span>{post.comments.length}</span>
						</button>
						<button className="flex items-center space-x-2 hover:text-green-500">
							<Share2 size={20} />
						</button>
					</div>

					{showComments[post._id] && (
						<div className="mt-4 space-y-4">
							<div className="flex items-center space-x-2">
								<input
									type="text"
									value={commentContent[post._id] || ""}
									onChange={(e) =>
										setCommentContent((prev) => ({
											...prev,
											[post._id]: e.target.value,
										}))
									}
									placeholder="Ajouter un commentaire..."
									className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<button
									onClick={() => handleComment(post._id)}
									disabled={commentMutation.isPending}
									className="p-2 text-blue-500 hover:text-blue-600 disabled:opacity-50"
								>
									<Send size={20} />
								</button>
							</div>

							<div className="space-y-3">
								{post.comments.map((comment) => (
									<div
										key={comment._id}
										className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg"
									>
										<img
											src={comment.user.profilePicture || "/default-avatar.png"}
											alt={comment.user.name}
											className="w-8 h-8 rounded-full"
										/>
										<div className="flex-1">
											<div className="flex items-center space-x-2">
												<h4 className="font-medium text-sm">
													{comment.user.name}
												</h4>
												<span className="text-xs text-gray-500">
													{formatDistanceToNow(new Date(comment.createdAt), {
														addSuffix: true,
														locale: fr,
													})}
												</span>
											</div>
											<p className="text-sm text-gray-700 mt-1">
												{comment.content}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			))}
		</div>
	);
};

export default PostList; 
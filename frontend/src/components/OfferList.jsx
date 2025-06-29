import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { Heart, MessageCircle, Send, Briefcase } from "lucide-react";

const OfferList = ({ offres }) => {
  const queryClient = useQueryClient();
  const [showApply, setShowApply] = useState({});
  const [cvFiles, setCvFiles] = useState({});
  const [lettreFiles, setLettreFiles] = useState({});
  const [commentContent, setCommentContent] = useState({});
  const [showComments, setShowComments] = useState({});

  // Mutation pour postuler
  const applyMutation = useMutation({
    mutationFn: async ({ offreId, cvFile, lettreFile }) => {
      const formData = new FormData();
      if (cvFile) formData.append("cv", cvFile);
      if (lettreFile) formData.append("lettreMotivation", lettreFile);
      await axiosInstance.post(`/offres/${offreId}/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Candidature envoyée !");
      setCvFiles({});
      setLettreFiles({});
      setShowApply({});
      queryClient.invalidateQueries(["offres"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de la candidature");
    },
  });

  // Mutation pour liker
  const likeMutation = useMutation({
    mutationFn: async (offreId) => {
      await axiosInstance.post(`/offres/${offreId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["offres"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors du like");
    },
  });

  // Mutation pour commenter
  const commentMutation = useMutation({
    mutationFn: async ({ offreId, content }) => {
      await axiosInstance.post(`/offres/${offreId}/comment`, { content });
    },
    onSuccess: () => {
      toast.success("Commentaire ajouté !");
      setCommentContent({});
      queryClient.invalidateQueries(["offres"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors du commentaire");
    },
  });

  if (!offres || offres.length === 0) {
    return <div className="text-center py-8 text-gray-500">Aucune offre pour le moment</div>;
  }

  return (
    <div className="space-y-6">
      {offres.map((offre) => (
        <div key={offre._id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Briefcase size={32} className="text-blue-600" />
            <div>
              <h3 className="font-medium text-lg">{offre.titre}</h3>
              <p className="text-sm text-gray-500">{offre.localisation} • {offre.typeContrat}</p>
              <p className="text-xs text-gray-400">Expire le {new Date(offre.dateExpiration).toLocaleDateString()}</p>
            </div>
          </div>
          <p className="text-gray-800 mb-4">{offre.description}</p>
          {offre.competencesRequises && offre.competencesRequises.length > 0 && (
            <div className="mb-4">
              <span className="font-medium text-gray-700">Compétences requises :</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {offre.competencesRequises.map((comp, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{comp}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center space-x-6 text-gray-500 mb-2">
            <button
              onClick={() => likeMutation.mutate(offre._id)}
              className="flex items-center space-x-2 hover:text-red-500"
            >
              <Heart size={20} />
              <span>{offre.likes?.length || 0}</span>
            </button>
            <button
              onClick={() => setShowComments((prev) => ({ ...prev, [offre._id]: !prev[offre._id] }))}
              className="flex items-center space-x-2 hover:text-blue-500"
            >
              <MessageCircle size={20} />
              <span>{offre.comments?.length || 0}</span>
            </button>
            <button
              onClick={() => setShowApply((prev) => ({ ...prev, [offre._id]: !prev[offre._id] }))}
              className="flex items-center space-x-2 hover:text-green-600"
            >
              <Briefcase size={20} />
              <span>Postuler</span>
            </button>
          </div>

          {/* Formulaire de candidature */}
          {showApply[offre._id] && (
            <form
              className="mt-4 space-y-2 bg-blue-50 p-4 rounded-lg"
              onSubmit={e => {
                e.preventDefault();
                applyMutation.mutate({
                  offreId: offre._id,
                  cvFile: cvFiles[offre._id],
                  lettreFile: lettreFiles[offre._id],
                });
              }}
            >
              <label className="block text-sm font-medium text-gray-700">CV (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setCvFiles(prev => ({ ...prev, [offre._id]: e.target.files[0] }))}
                className="w-full p-2 border rounded-lg"
                required
              />
              <label className="block text-sm font-medium text-gray-700">Lettre de motivation (PDF, optionnel)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setLettreFiles(prev => ({ ...prev, [offre._id]: e.target.files[0] }))}
                className="w-full p-2 border rounded-lg"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={applyMutation.isPending}
              >
                {applyMutation.isPending ? "Envoi..." : "Envoyer ma candidature"}
              </button>
            </form>
          )}

          {/* Commentaires */}
          {showComments[offre._id] && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={commentContent[offre._id] || ""}
                  onChange={e => setCommentContent(prev => ({ ...prev, [offre._id]: e.target.value }))}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => commentMutation.mutate({ offreId: offre._id, content: commentContent[offre._id] })}
                  disabled={commentMutation.isPending}
                  className="p-2 text-blue-500 hover:text-blue-600 disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {offre.comments && offre.comments.length > 0 ? (
                  offre.comments.map((comment) => (
                    <div key={comment._id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="font-medium text-sm">{comment.user?.name || "Utilisateur inconnu"}</span>
                        <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
                        <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm">Aucun commentaire</div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OfferList; 
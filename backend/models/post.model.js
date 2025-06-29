import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
	{
		author: { 
			type: mongoose.Schema.Types.ObjectId, 
			ref: "User", 
			required: true 
		},
		content: { 
			type: String,
			required: function() {
				return !this.image; // Le contenu est requis seulement s'il n'y a pas d'image
			}
		},
		image: { 
			type: String 
		},
		visibility: {
			type: String,
			enum: ["public", "private"],
			default: "public"
		},
		// Champs spécifiques aux posts de recruteurs
		isJobPost: {
			type: Boolean,
			default: false
		},
		jobDetails: {
			titre: String,
			localisation: String,
			typeContrat: {
				type: String,
				enum: ["CDI", "CDD", "Stage", "Freelance", "Alternance"]
			},
			competencesRequises: [String],
			dateExpiration: Date
		},
		candidatures: [
			{
				laureat: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				cv: String,
				lettreMotivation: String,
				datePostulation: {
					type: Date,
					default: Date.now,
				},
			},
		],
		likes: [{ 
			type: mongoose.Schema.Types.ObjectId, 
			ref: "User"
		}],
		comments: [{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				required: true
			},
			content: {
				type: String,
				required: true
			},
			createdAt: {
				type: Date,
				default: Date.now
			}
		}],
	},
	{ 
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

// Index pour améliorer les performances
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ likes: 1 });
postSchema.index({ isJobPost: 1 });

// Méthode pour formater le post
postSchema.methods.toJSON = function() {
	const post = this.toObject();
	delete post.__v;
	return post;
};

const Post = mongoose.model("Post", postSchema);

export default Post;

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		recipient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		content: {
			type: String,
			required: true,
			trim: true,
		},
		media: {
			type: String,
		},
		read: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

// Index pour améliorer les performances des requêtes
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message; 
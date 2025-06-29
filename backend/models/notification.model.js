import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
	recipient: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	type: {
		type: String,
		enum: ["like", "comment", "connection_request", "connection_accepted", "post_shared", "message"],
		required: true
	},
	post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Post"
	},
	message: {
		type: String,
		default: ""
	},
	read: {
		type: Boolean,
		default: false
	}
}, {
	timestamps: true
});

// Index pour améliorer les performances des requêtes
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

// Méthode pour formater la notification
notificationSchema.methods.toJSON = function() {
	const notification = this.toObject();
	delete notification.__v;
	return notification;
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

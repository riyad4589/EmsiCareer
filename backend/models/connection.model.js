import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
    {
        user1: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        user2: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["accepted", "pending", "rejected"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

// Index pour améliorer les performances des requêtes
connectionSchema.index({ user1: 1, user2: 1 }, { unique: true });
connectionSchema.index({ status: 1 });

const Connection = mongoose.model("Connection", connectionSchema);

export default Connection; 
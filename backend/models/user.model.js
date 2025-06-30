import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
		},
		emailEdu: {
			type: String,
			required: true,
			unique: true,
		},
		emailPersonelle: {
			type: String,
			required: false,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		profilePicture: {
			type: String,
			default: "",
		},
		banniere: {
			type: String,
			default: "",
		},
		role: {
			type: String,
			enum: ["user", "admin", "recruteur"],
			default: "user",
		},
		status: {
			type: String,
			enum: ["pending", "active", "rejected"],
			default: "pending",
		},
		headline: {
			type: String,
			default: "",
		},
		// Champs spécifiques aux recruteurs
		companyName: {
			type: String,
			required: function() {
				return this.role === "recruteur";
			}
		},
		companyLogo: {
			type: String,
			default: ""
		},
		industry: {
			type: String,
			required: function() {
				return this.role === "recruteur";
			}
		},
		description: {
			type: String,
			required: function() {
				return this.role === "recruteur";
			}
		},
		website: {
			type: String,
			default: ""
		},
		location: {
			type: String,
			required: function() {
				return this.role === "recruteur";
			}
		},
		socialLinks: {
			linkedin: {
				type: String,
				default: ""
			},
			twitter: {
				type: String,
				default: ""
			},
			facebook: {
				type: String,
				default: ""
			}
		},
		cv: {
			type: String,
			default: ""
		}

	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

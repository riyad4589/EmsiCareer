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
		// Nouveaux champs pour les informations de contact
		email: {
			type: String,
			default: function() {
				return this.emailEdu || "";
			},
		},
		phone: {
			type: String,
			default: "",
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
		// Section À propos
		about: {
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
		companyDescription: {
			type: String,
			default: "",
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
		// Nouveaux champs pour les réseaux sociaux
		linkedin: {
			type: String,
			default: "",
		},
		github: {
			type: String,
			default: "",
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
		// Section Expérience
		experience: [{
			title: {
				type: String,
				default: "",
			},
			company: {
				type: String,
				default: "",
			},
			startDate: {
				type: String,
				default: "",
			},
			endDate: {
				type: String,
				default: "",
			},
			description: {
				type: String,
				default: "",
			},
		}],
		// Section Éducation
		education: [{
			degree: {
				type: String,
				default: "",
			},
			school: {
				type: String,
				default: "",
			},
			startDate: {
				type: String,
				default: "",
			},
			endDate: {
				type: String,
				default: "",
			},
			description: {
				type: String,
				default: "",
			},
		}],
		// Section Compétences
		skills: [{
			name: {
				type: String,
				default: "",
			},
			level: {
				type: String,
				enum: ["débutant", "intermédiaire", "avancé", "expert"],
				default: "débutant",
			},
		}],
		cv: {
			type: String,
			default: ""
		}

	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

import mongoose from "mongoose";

const offreSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // le recruteur
      required: true,
    },

    titre: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    localisation: {
      type: String,
      required: true,
    },

    typeContrat: {
      type: String,
      enum: ["CDI", "CDD", "Stage", "Freelance", "Alternance"],
      default: "CDI",
    },

    competencesRequises: {
      type: [String],
      default: [],
    },

    dateExpiration: {
      type: Date,
      required: true,
    },

    medias: {
      type: [String], // URLs Cloudinary (images, vidéos, gifs)
      default: [],
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

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
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending"
        }
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexation utile
offreSchema.index({ author: 1 });
offreSchema.index({ createdAt: -1 });
offreSchema.index({ likes: 1 });

// Nettoyage à l'export
offreSchema.methods.toJSON = function () {
  const offre = this.toObject();
  delete offre.__v;
  return offre;
};

const Offre = mongoose.model("Offre", offreSchema);
export default Offre;

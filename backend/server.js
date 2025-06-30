import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import fileUpload from "express-fileupload";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import connectionRoutes from "./routes/connection.route.js";
import adminRoutes from "./routes/admin.route.js";
import messageRoutes from "./routes/message.route.js";
import recruteurRoutes from "./routes/recruteur.route.js";
import offresRoutes from "./routes/offres.route.js";
import routesIndex from "./routes/index.js";

// Charger les variables d'environnement en premier
dotenv.config();

// Vérifier que MONGO_URI est défini
if (!process.env.MONGO_URI) {
	console.error("MONGO_URI n'est pas défini dans le fichier .env");
	process.exit(1);
}

const app = express();
const httpServer = createServer(app);

// Configuration CORS
const corsOptions = {
	origin: process.env.CLIENT_URL || "http://localhost:5173",
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
};

// Configuration Socket.IO
const io = new Server(httpServer, {
	cors: corsOptions,
	allowEIO3: true,
});

// Middleware
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(fileUpload({
	useTempFiles: true,
	tempFileDir: '/tmp/',
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
	abortOnLimit: true
}));

// Socket.IO middleware pour l'authentification
io.use((socket, next) => {
	const token = socket.handshake.auth.token;
	console.log("Socket.IO - Tentative de connexion avec token:", token ? "Présent" : "Absent");
	
	if (!token) {
		console.log("Socket.IO - Erreur d'authentification: Token manquant");
		return next(new Error("Authentication error"));
	}
	
	console.log("Socket.IO - Authentification réussie");
	next();
});

// Gestion des connexions Socket.IO
io.on("connection", (socket) => {
	console.log("Socket.IO - Nouvelle connexion établie");

	socket.on("join", (userId) => {
		console.log(`Socket.IO - Utilisateur ${userId} a rejoint sa salle`);
		socket.join(userId);
	});

	socket.on("disconnect", () => {
		console.log("Socket.IO - Un utilisateur s'est déconnecté");
	});

	socket.on("error", (error) => {
		console.error("Socket.IO - Erreur:", error);
	});
});

// Rendre io accessible globalement
app.set("io", io);

// Routes API v1
app.use("/api/v1", routesIndex);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/recruteur", recruteurRoutes);
app.use("/api/v1/offres", offresRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
	.then(() => {
		console.log("Connecté à MongoDB avec succès");
		// Démarrer le serveur seulement après la connexion à MongoDB
		const PORT = process.env.PORT || 5000;
		httpServer.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch((error) => {
		console.error("Erreur de connexion à MongoDB:", error);
		process.exit(1);
	});

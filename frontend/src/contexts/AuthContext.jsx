import { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const queryClient = useQueryClient();

	const { data: user, isLoading } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) return null;
				
				const response = await axiosInstance.get("/auth/me");
				return response.data;
			} catch (error) {
				console.error("Erreur lors de la récupération de l'utilisateur:", error);
				localStorage.removeItem("token");
				return null;
			}
		},
		enabled: !!localStorage.getItem("token"),
		staleTime: 0, // Désactiver le cache
		retry: false, // Ne pas réessayer en cas d'échec
	});

	const login = async (credentials) => {
		try {
			const response = await axiosInstance.post("/auth/login", credentials);
			const { token, user } = response.data;
			localStorage.setItem("token", token);
			queryClient.setQueryData(["authUser"], user);
			toast.success("Connexion réussie");
			return user;
		} catch (error) {
			console.error("Erreur lors de la connexion:", error);
			toast.error(error.response?.data?.message || "Erreur lors de la connexion");
			throw error;
		}
	};

	const logout = () => {
		localStorage.removeItem("token");
		queryClient.setQueryData(["authUser"], null);
		queryClient.clear(); // Vider le cache
		toast.success("Déconnexion réussie");
	};

	const value = {
		user,
		isLoading,
		isAuthenticated: !!user,
		login,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 
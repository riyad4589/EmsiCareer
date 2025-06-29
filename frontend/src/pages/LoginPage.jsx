import { Link, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";

const LoginPage = () => {
	const { data: authUser, isLoading } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			const response = await axiosInstance.get("/auth/me");
			return response.data;
		},
		enabled: !!localStorage.getItem("token")
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-green-50">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
			</div>
		);
	}

	if (authUser) {
		return <Navigate to={authUser.role === "admin" ? "/admin" : authUser.role === "recruteur" ? "/RecruteurDashboard" : "/home"} replace />;
	}

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!username.trim() || !password.trim()) {
			toast.error("Veuillez remplir tous les champs");
			return;
		}
		try {
			const user = await login({ username, password });
			navigate(user.role === "admin" ? "/admin" : user.role === "recruteur" ? "/RecruteurDashboard" : "/home", { replace: true });
		} catch (error) {
			toast.error("Nom d'utilisateur ou mot de passe incorrect");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
			<div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
				<div className="text-center mb-6">
					<img className="mx-auto h-20" src="/logo.png" alt="Logo" />
					<h2 className="mt-4 text-2xl font-bold text-green-700">Connexion à votre compte</h2>
					<p className="text-sm text-green-600">Bienvenue ! Veuillez vous connecter.</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label htmlFor="username" className="block text-sm font-medium text-gray-700">
							Nom d'utilisateur
						</label>
						<input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Nom d'utilisateur"
							className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
						/>
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700">
							Mot de passe
						</label>
						<div className="relative mt-1">
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Mot de passe"
								className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-2.5 text-green-600 hover:text-green-800"
							>
								{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					<button
						type="submit"
						className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
					>
						Se connecter
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-gray-600">
					Pas encore de compte ?{" "}
					<Link to="/signup" className="text-green-600 hover:text-green-800 font-medium">
						Créer un compte
					</Link>
				</p>
			</div>
		</div>
	);
};

export default LoginPage;
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Eye, EyeOff, Briefcase, Users, Award } from "lucide-react";
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
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
				<div className="flex flex-col items-center space-y-4">
					<div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
					<p className="text-emerald-700 font-medium">Chargement...</p>
				</div>
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
		<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b border-gray-100">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
								<Briefcase className="w-6 h-6 text-white" />
							</div>
							<span className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
								Emsi Community
							</span>
						</div>
						<nav className="hidden md:flex items-center space-x-8">
							<a href="#" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">À propos</a>
							<a href="#" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Carrières</a>
							<a href="#" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Contact</a>
						</nav>
					</div>
				</div>
			</div>

			<div className="flex-1 flex">
				{/* Left Side - Hero Section */}
				<div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
					<div className="max-w-lg">
						<h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
							Bienvenue dans votre 
							<span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"> réseau professionnel</span>
						</h1>
						<p className="text-xl text-gray-600 mb-8 leading-relaxed">
							Connectez-vous avec vos collègues, découvrez de nouvelles opportunités et développez votre carrière.
						</p>
						
						{/* Features */}
						<div className="space-y-4">
							<div className="flex items-center space-x-4">
								<div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
									<Users className="w-6 h-6 text-emerald-600" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900">Réseau étendu</h3>
									<p className="text-gray-600">Plus de 10,000 professionnels connectés</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
									<Briefcase className="w-6 h-6 text-green-600" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900">Opportunités</h3>
									<p className="text-gray-600">Découvrez des milliers d'offres d'emploi</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
									<Award className="w-6 h-6 text-teal-600" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900">Reconnaissance</h3>
									<p className="text-gray-600">Mettez en valeur vos compétences</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Right Side - Login Form */}
				<div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12">
					<div className="w-full max-w-md">
						<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
							{/* Card Header */}
							<div className="bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6">
								<h2 className="text-2xl font-bold text-white text-center">Connexion</h2>
								<p className="text-emerald-100 text-center mt-2">Accédez à votre espace professionnel</p>
							</div>

							{/* Card Body */}
							<div className="px-8 py-8">
									<div onSubmit={handleSubmit} className="space-y-6">
										<div>
											<label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
												Nom d'utilisateur
											</label>
											<input
												id="username"
												type="text"
												value={username}
												onChange={(e) => setUsername(e.target.value)}
												placeholder="Entrez votre nom d'utilisateur"
												className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400"
											/>
										</div>

										<div>
											<label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
												Mot de passe
											</label>
											<div className="relative">
												<input
													id="password"
													type={showPassword ? "text" : "password"}
													value={password}
													onChange={(e) => setPassword(e.target.value)}
													placeholder="Entrez votre mot de passe"
													className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400 pr-12"
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
												>
													{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
												</button>
											</div>
										</div>

										<div className="flex items-center justify-between">
											<label className="flex items-center">
												<input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
												<span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
											</label>
											<a href="#" className="text-sm text-emerald-600 hover:text-emerald-800 font-medium">
												Mot de passe oublié ?
											</a>
										</div>

										<button
											type="button"
											onClick={handleSubmit}
											disabled={isLoading}
											className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{isLoading ? (
												<div className="flex items-center justify-center">
													<div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
													Connexion...
												</div>
											) : (
												"Se connecter"
											)}
										</button>
									</div>

								{/* Divider */}
								<div className="my-8 flex items-center">
									<div className="flex-grow border-t border-gray-200"></div>
									<div className="flex-grow border-t border-gray-200"></div>
								</div>
								
								{/* Sign up link */}
								<div className="mt-8 text-center">
									<p className="text-gray-600">
										Nouveau sur CareerHub ?{" "}
										<Link to="/signup" className="text-emerald-600 hover:text-emerald-800 font-semibold">
											Rejoignez-nous maintenant
										</Link>
									</p>
								</div>
							</div>
						</div>

						{/* Terms */}
						<div className="mt-8 text-center">
							<p className="text-xs text-gray-500">
								En vous connectant, vous acceptez nos{" "}
								<a href="#" className="text-emerald-600 hover:underline">Conditions d'utilisation</a> et notre{" "}
								<a href="#" className="text-emerald-600 hover:underline">Politique de confidentialité</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
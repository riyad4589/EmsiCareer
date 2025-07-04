import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios.js";
import { toast } from "react-hot-toast";
import { Loader, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

const PasswordStrengthIndicator = ({ password }) => {
	const getStrength = (password) => {
		let strength = 0;
		if (password.length >= 8) strength++;
		if (password.match(/[a-z]/)) strength++;
		if (password.match(/[A-Z]/)) strength++;
		if (password.match(/[0-9]/)) strength++;
		if (password.match(/[^a-zA-Z0-9]/)) strength++;
		return strength;
	};

	const strength = getStrength(password);
	const strengthLabels = ["Très faible", "Faible", "Moyen", "Fort", "Très fort", "Excellent"];
	const strengthColors = ["bg-red-500", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-green-600"];

	return (
		<div className="mt-1">
			<div className="flex justify-between items-center mb-1">
				<span className="text-xs text-gray-500">Force du mot de passe</span>
				<span className={`text-xs font-semibold ${strength > 2 ? 'text-green-600' : 'text-red-600'}`}>{strengthLabels[strength]}</span>
			</div>
			<div className="w-full bg-gray-200 rounded-full h-2">
				<div
					className={`h-2 rounded-full ${strengthColors[strength]}`}
					style={{ width: `${(strength / 5) * 100}%`, transition: 'width 0.3s' }}
				></div>
			</div>
		</div>
	);
};

const SignUpForm = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [role, setRole] = useState("user");

	const queryClient = useQueryClient();

	const { mutate: signUpMutation, isLoading } = useMutation({
		mutationFn: async (data) => {
			try {
				console.log("Envoi des données d'inscription:", { ...data, password: "***" });
				const res = await axiosInstance.post("/auth/signup", data);
				console.log("Réponse du serveur:", res.data);
				return res.data;
			} catch (error) {
				console.error("Erreur détaillée:", error.response?.data || error);
				throw error;
			}
		},
		onSuccess: (data) => {
			console.log("Inscription réussie:", data);
			toast.success(data.message || "Compte créé avec succès");
			if (data.redirect) {
				queryClient.invalidateQueries({ queryKey: ["authUser"] });
			}
		},
		onError: (err) => {
			console.error("Erreur lors de l'inscription:", err);
			const errorMessage = err.response?.data?.message || "Une erreur est survenue lors de l'inscription";
			toast.error(errorMessage);
		},
	});

	const validateForm = () => {
		if (!name.trim()) {
			toast.error("Le nom complet est requis");
			return false;
		}
		if (!username.trim()) {
			toast.error("Le nom d'utilisateur est requis");
			return false;
		}
		if (!email.trim()) {
			toast.error("L'email est requis");
			return false;
		}
		if (!email.includes("@")) {
			toast.error("L'email n'est pas valide");
			return false;
		}
		if (role === "user" && !email.endsWith("@emsi-edu.ma")) {
			toast.error("L'email doit se terminer par @emsi-edu.ma pour les utilisateurs");
			return false;
		} else if ((role === "admin" || role === "recruteur") && !email.endsWith("@emsi.ma")) {
			toast.error("L'email doit se terminer par @emsi.ma pour les administrateurs et recruteurs");
			return false;
		}
		if (!password.trim()) {
			toast.error("Le mot de passe est requis");
			return false;
		}
		if (password.length < 6) {
			toast.error("Le mot de passe doit contenir au moins 6 caractères");
			return false;
		}
		if (password !== confirmPassword) {
			toast.error("Les mots de passe ne correspondent pas");
			return false;
		}
		return true;
	};

	const handleSignUp = (e) => {
		e.preventDefault();
		if (validateForm()) {
			console.log("Validation du formulaire réussie, envoi des données...");
			signUpMutation({ name, username, email, password });
		}
	};

	return (
		<div className="w-full max-w-md space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold">Inscription</h2>
				<p className="text-info mt-2">Créez votre compte pour commencer</p>
			</div>
			<form onSubmit={handleSignUp} className='space-y-4'>
				<div className="space-y-2">
					<label htmlFor="name" className="block text-sm font-medium text-info">
						Nom complet
					</label>
					<input
						id="name"
						type='text'
						placeholder='Entrez votre nom complet'
						value={name}
						onChange={(e) => setName(e.target.value)}
						className='input input-bordered w-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-success'
						required
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="username" className="block text-sm font-medium text-info">
						Nom d'utilisateur
					</label>
					<input
						id="username"
						type='text'
						placeholder='Choisissez un nom d\'utilisateur'
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className='input input-bordered w-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-success'
						required
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="email" className="block text-sm font-medium text-info">
						Email
					</label>
					<input
						id="email"
						type='email'
						placeholder='Entrez votre email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className='input input-bordered w-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-success'
						required
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="password" className="block text-sm font-medium text-info">
						Mot de passe
					</label>
					<div className="relative">
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							placeholder='Créez un mot de passe (6+ caractères)'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className='input input-bordered w-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-success pr-10'
							required
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-info hover:text-success transition-colors duration-200"
						>
							{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
					{password && <PasswordStrengthIndicator password={password} />}
				</div>
				<div className="space-y-2">
					<label htmlFor="confirmPassword" className="block text-sm font-medium text-info">
						Confirmer le mot de passe
					</label>
					<div className="relative">
						<input
							id="confirmPassword"
							type={showConfirmPassword ? 'text' : 'password'}
							placeholder='Confirmez votre mot de passe'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className='input input-bordered w-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-success pr-10'
							required
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-info hover:text-success transition-colors duration-200"
						>
							{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
				</div>

				<button 
					type='submit' 
					disabled={isLoading}
					className='btn btn-success w-full hover:bg-success-dark transition-colors duration-200'
				>
					{isLoading ? (
						<>
							<Loader className='size-5 animate-spin' />
							<span>Création du compte...</span>
						</>
					) : (
						"Créer un compte"
					)}
				</button>
			</form>
			<div className="text-center text-sm text-info">
				<p>
					Déjà un compte ?{" "}
					<Link to="/login" className="text-success hover:text-success-dark transition-colors duration-200">
						Se connecter
					</Link>
				</p>
			</div>
		</div>
	);
};

export default SignUpForm;

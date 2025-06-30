import { useState } from "react";
import { Eye, EyeOff, Briefcase, Users, Award, UserPlus, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";

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

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        emailEdu: "",
        emailPersonelle: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [errors, setErrors] = useState({});
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    // Validation des champs
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = "Le nom complet est requis";
        }
        if (!formData.username.trim()) {
            newErrors.username = "Le nom d'utilisateur est requis";
        } else if (formData.username.length < 3) {
            newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
        }
        if (!formData.emailEdu.trim()) {
            newErrors.emailEdu = "L'email éducatif est requis";
        } else if (!formData.emailEdu.includes('@emsi-edu.ma')) {
            newErrors.emailEdu = "Veuillez utiliser un email éducatif (@emsi-edu.ma)";
        }
        if (!formData.password) {
            newErrors.password = "Le mot de passe est requis";
        } else if (formData.password.length < 8) {
            newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
        }
<<<<<<<<< Temporary merge branch 1
      //  if (!isTermsAccepted) {
        //    newErrors.terms = "Vous devez accepter les conditions d'utilisation";
=========
        // if (!isTermsAccepted) {
        //     newErrors.terms = "Vous devez accepter les conditions d'utilisation";
>>>>>>>>> Temporary merge branch 2
        // }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Fonction pour envoyer les données à l'API
    const submitToAPI = async (userData) => {
        try {
            const response = await axiosInstance.post('/auth/signup', {
                name: userData.name,
                username: userData.username,
                emailEdu: userData.emailEdu,
                emailPersonelle: userData.emailPersonelle,
                password: userData.password
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        if (!validateForm()) {
            setMessage({ type: 'error', text: 'Veuillez corriger les erreurs dans le formulaire' });
            return;
        }
        setIsPending(true);
        try {
            const result = await submitToAPI(formData);
            if (result.success) {
                setMessage({ type: 'success', text: 'Inscription réussie ! Vérifiez votre email pour activer votre compte.' });
                setFormData({ name: "", username: "", emailEdu: "", emailPersonelle: "", password: "", confirmPassword: "" });
                setIsTermsAccepted(false);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
        setIsPending(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-1">
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
                            Commencez votre
                            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"> parcours professionnel</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Rejoignez des milliers de professionnels qui font évoluer leur carrière avec CareerHub.
                        </p>
                        {/* Benefits */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <UserPlus className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Inscription gratuite</h3>
                                    <p className="text-gray-600">Créez votre profil en quelques minutes</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Communauté active</h3>
                                    <p className="text-gray-600">Connectez-vous avec des experts de votre domaine</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                                    <Award className="w-6 h-6 text-teal-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Opportunités exclusives</h3>
                                    <p className="text-gray-600">Accédez à des offres d'emploi premium</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right Side - Signup Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12">
                    <div className="w-full max-w-md">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6">
                                <h2 className="text-2xl font-bold text-white text-center">Inscription</h2>
                                <p className="text-emerald-100 text-center mt-2">Créez votre compte professionnel</p>
                            </div>
                            {/* Card Body */}
                            <div className="px-8 py-8">
                                {/* Message d'état */}
                                {message.text && (
                                    <div className={`mb-6 p-4 rounded-lg flex items-center ${
                                        message.type === 'success' 
                                            ? 'bg-green-50 text-green-800 border border-green-200' 
                                            : 'bg-red-50 text-red-800 border border-red-200'
                                    }`}>
                                        {message.type === 'success' ? (
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 mr-2" />
                                        )}
                                        {message.text}
                                    </div>
                                )}
                                <div className="space-y-5">
                                    {/* Nom complet */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Nom complet
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Entrez votre nom complet"
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400 ${
                                                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                            }`}
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>
                                    {/* Nom d'utilisateur */}
                                    <div>
                                        <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Nom d'utilisateur
                                        </label>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            required
                                            value={formData.username}
                                            onChange={handleChange}
                                            placeholder="Choisissez un nom d'utilisateur"
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400 ${
                                                errors.username ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                            }`}
                                        />
                                        {errors.username && (
                                            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                                        )}
                                    </div>
                                    {/* Email Éducatif */}
                                    <div>
                                        <label htmlFor="emailEdu" className="block text-sm font-semibold text-gray-700 mb-2">
                                            <Mail className="w-4 h-4 inline mr-1" />
                                            Email Éducatif
                                        </label>
                                        <input
                                            id="emailEdu"
                                            name="emailEdu"
                                            type="email"
                                            required
                                            value={formData.emailEdu}
                                            onChange={handleChange}
                                            placeholder="votre-email@universite.edu"
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400 ${
                                                errors.emailEdu ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                            }`}
                                        />
                                        {errors.emailEdu && (
                                            <p className="mt-1 text-sm text-red-600">{errors.emailEdu}</p>
                                        )}
                                    </div>
                                    {/* Email Personnel */}
                                    <div>
                                        <label htmlFor="emailPersonelle" className="block text-sm font-semibold text-gray-700 mb-2">
                                            <Mail className="w-4 h-4 inline mr-1" />
                                            Email Personnel <span className="text-gray-400 font-normal">(Optionnel)</span>
                                        </label>
                                        <input
                                            id="emailPersonelle"
                                            name="emailPersonelle"
                                            type="email"
                                            value={formData.emailPersonelle}
                                            onChange={handleChange}
                                            placeholder="votre-email@exemple.com"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400"
                                        />
                                    </div>
                                    {/* Mot de passe */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                            <Lock className="w-4 h-4 inline mr-1" />
                                            Mot de passe
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Créez un mot de passe sécurisé"
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400 pr-12 ${
                                                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {formData.password && <PasswordStrengthIndicator password={formData.password} />}
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                        )}
                                    </div>
                                    {/* Confirmer mot de passe */}
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                            <Lock className="w-4 h-4 inline mr-1" />
                                            Confirmer le mot de passe
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirmez votre mot de passe"
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400 pr-12 ${
                                                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                                        )}
                                    </div>
                                    {errors.terms && (
                                        <p className="text-sm text-red-600 mt-1">{errors.terms}</p>
                                    )}
                                    <div className="my-8 flex items-center">
									<div className="flex-grow border-t border-gray-200"></div>
									<div className="flex-grow border-t border-gray-200"></div>
								</div>

                                    {/* Submit button */}
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isPending}
                                        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPending ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                                Création du compte...
                                            </div>
                                        ) : (
                                            "Créer mon compte"
                                        )}
                                    </button>
                                </div>
                                {/* Login link */}
                                <div className="mt-8 text-center">
                                    <p className="text-gray-600">
                                        Déjà membre de CareerHub ?{" "}
                                        <a href="#" className="text-emerald-600 hover:text-emerald-800 font-semibold">
                                            Connectez-vous
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Additional info */}
                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-500">
                                Votre email éducatif nous aide à vérifier votre statut étudiant et vous donne accès à des fonctionnalités exclusives.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
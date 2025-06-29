import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        emailEdu: "",
        emailPersonelle: "",
        password: "",
        confirmPassword: ""
    });
    const navigate = useNavigate();

    const { mutate: signup, isPending } = useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.post("/auth/signup", data);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.");
            navigate("/login");
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de l'inscription";
            toast.error(errorMessage);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }
        signup(formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-6">
                    <img className="mx-auto h-20" src="/logo.png" alt="Logo" />
                    <h2 className="mt-4 text-2xl font-bold text-green-700">Créer un compte</h2>
                    <p className="text-sm text-green-600">Rejoignez-nous dès maintenant !</p>
                </div>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nom complet
                        </label>
                        <div className="mt-1">
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Nom d'utilisateur
                        </label>
                        <div className="mt-1">
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="emailEdu" className="block text-sm font-medium text-gray-700">
                            Email Éducatif
                        </label>
                        <div className="mt-1">
                            <input
                                id="emailEdu"
                                name="emailEdu"
                                type="email"
                                required
                                value={formData.emailEdu}
                                onChange={handleChange}
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="emailPersonelle" className="block text-sm font-medium text-gray-700">
                            Email Personnel (Optionnel)
                        </label>
                        <div className="mt-1">
                            <input
                                id="emailPersonelle"
                                name="emailPersonelle"
                                type="email"
                                value={formData.emailPersonelle}
                                onChange={handleChange}
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Mot de passe
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirmer le mot de passe
                        </label>
                        <div className="mt-1">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            {isPending ? "Création du compte..." : "Créer un compte"}
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-green-600 hover:text-green-800 font-medium">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage; 
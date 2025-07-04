import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import NetworkPage from "./pages/NetworkPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import PostPage from "./pages/PostPage";
import JobOffersPage from "./pages/JobOffersPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ChatPage from "./pages/ChatPage";
import UsersManagementPage from "./pages/admin/UsersManagementPage";
import PostsManagementPage from "./pages/admin/PostsManagementPage";
import RecruitersManagementPage from "./pages/admin/RecruitersManagementPage";
import OffersManagementPage from "./pages/admin/OffersManagementPage";
import AdminRoute from "./components/AdminRoute";
import LayoutRecruteur from "./components/layout/LayoutRecruteur";
import DashboardPage from "./pages/recruteur/DashboardPage";
import OffresPage from "./pages/recruteur/OffresPage";
import ProfilPage from "./pages/recruteur/ProfilPage";
import RecruteurMessage from "./pages/recruteur/RecruteurMessage";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
		},
	},
});

function AppRoutes() {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
			</div>
		);
	}

	return (
		<Routes>
			<Route path="/" element={<Navigate to="/login" replace />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/signup" element={<SignUpPage />} />

			{/* Routes du recruteur : layout spécial */}
			<Route element={<LayoutRecruteur />}>
				<Route path="/RecruteurDashboard" element={<DashboardPage />} />
				<Route path="/recruteur/offres" element={<OffresPage />} />
				<Route path="/recruteur/profil" element={<ProfilPage />} />
				<Route path="/recruteur/messages" element={<RecruteurMessage />} />
			</Route>

			{/* Layout principal pour le reste */}
			<Route element={<Layout />}>
				{user ? (
					<>
						<Route path="/home" element={<HomePage />} />
						<Route path="/network" element={<NetworkPage />} />
						<Route path="/job-offers" element={<JobOffersPage />} />
						<Route path="/notifications" element={<NotificationsPage />} />
						<Route path="/post/:postId" element={<PostPage />} />
						<Route path="/profile/:username" element={<ProfilePage />} />
						<Route path="/messages" element={<ChatPage />} />
						<Route path="/messages/:userId" element={<ChatPage />} />
						{user.role === "admin" && (
							<>
								<Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
								<Route path="/admin/users" element={<AdminRoute><UsersManagementPage /></AdminRoute>} />
								<Route path="/admin/recruiters" element={<AdminRoute><RecruitersManagementPage /></AdminRoute>} />
								<Route path="/admin/posts" element={<AdminRoute><PostsManagementPage /></AdminRoute>} />
								<Route path="/admin/offers" element={<AdminRoute><OffersManagementPage /></AdminRoute>} />
							</>
						)}
					</>
				) : (
					<Route path="*" element={<Navigate to="/login" replace />} />
				)}
			</Route>
			<Route path="*" element={<Navigate to="/login" replace />} />
		</Routes>
	);
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<Toaster position="top-center" />
				<AppRoutes />
			</AuthProvider>
		</QueryClientProvider>
	);
}

export default App;

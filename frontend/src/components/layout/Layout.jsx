import { useQuery } from "@tanstack/react-query";
import Navbar from "./Navbar";
import AdminNavbar from "./AdminNavbar";
import { Toaster } from "react-hot-toast";
import ChatbotWidget from "../ChatbotWidget";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Layout = ({ children }) => {
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const navigate = useNavigate();

	useEffect(() => {
		if (authUser === null) {
			navigate("/login");
		}
	}, [authUser, navigate]);

	return (
		<div className='min-h-screen bg-gray-100'>
			{authUser?.role === "admin" ? <AdminNavbar /> : <Navbar />}
			<main className='max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8'>
				{children}
			</main>
			{/* Chatbot visible uniquement pour user et recruteur */}
			{authUser && (authUser.role === "user" || authUser.role === "recruteur") && <ChatbotWidget />}
			<Toaster />
		</div>
	);
};
export default Layout;

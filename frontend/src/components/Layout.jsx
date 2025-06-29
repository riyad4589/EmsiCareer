import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import AdminNavbar from "./layout/AdminNavbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { LayoutDashboard, Users, Building2, FileText } from "lucide-react";
import { useLocation } from "react-router-dom";

const Layout = () => {
	const { user } = useAuth();
	const isAdmin = user?.role === "admin";
	const location = useLocation();

	return (
		<div className="min-h-screen bg-gray-50">
			{isAdmin ? <AdminNavbar /> : <Navbar />}
			<main className="pt-16">
				{!isAdmin && user && (
					<div className="container mx-auto px-4 py-8">
						<div className="grid grid-cols-12 gap-8">
							<div className="col-span-3">
								<Sidebar user={user} />
							</div>
							<div className="col-span-9">
								<Outlet />
							</div>
						</div>
					</div>
				)}
				{isAdmin && (
					<>
					</>
				)}
				{isAdmin && <Outlet />}
			</main>
		</div>
	);
};

export default Layout; 
import { useQuery } from "@tanstack/react-query";
import Navbar from "./Navbar";
import AdminNavbar from "./AdminNavbar";
import { Toaster } from "react-hot-toast";

const Layout = ({ children }) => {
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const isAdmin = authUser?.role === "admin";

	return (
		<div className='min-h-screen bg-base-100'>
			{isAdmin ? <AdminNavbar /> : <Navbar />}
			<main className='max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8'>
				{children}
			</main>
		</div>
	);
};
export default Layout;

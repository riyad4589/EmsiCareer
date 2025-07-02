import { Outlet } from "react-router-dom";
import SidebarRecruteur from "../recruteur/SidebarRecruteur";
import NavbarRecruteur from "../recruteur/NavbarRecruteur";

const LayoutRecruteur = () => {
    return (
        <div className="min-h-screen bg-green-50">
            <NavbarRecruteur />
            <div className="flex pt-16">
                {/* <div className="w-64">
                    <SidebarRecruteur />
                </div> */}
                <main className="flex-1 max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default LayoutRecruteur; 
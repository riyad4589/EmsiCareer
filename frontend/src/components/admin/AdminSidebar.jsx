import { Users, FileText, Building2 } from "lucide-react";

const menuItems = [
	{
		title: "Tableau de bord",
		icon: <LayoutDashboard className="w-5 h-5" />,
		path: "/admin"
	},
	{
		title: "Utilisateurs",
		icon: <Users className="w-5 h-5" />,
		path: "/admin/users"
	},
	{
		title: "Recruteurs",
		icon: <Building2 className="w-5 h-5" />,
		path: "/admin/recruiters"
	},
	{
		title: "Posts",
		icon: <FileText className="w-5 h-5" />,
		path: "/admin/posts"
	},
	{
		title: "Offers",
		icon: <FileText className="w-5 h-5" />,
		path: "/admin/offers"
	}
]; 
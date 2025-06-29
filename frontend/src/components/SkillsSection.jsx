import { X, Plus, Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

const SkillsSection = ({ userData, isOwnProfile, onSave }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [skills, setSkills] = useState(userData.skills || []);
	const [newSkill, setNewSkill] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const handleAddSkill = () => {
		if (!newSkill.trim()) {
			toast.error("Le nom de la compétence est requis");
			return;
		}
		if (skills.includes(newSkill.trim())) {
			toast.error("Cette compétence existe déjà");
			return;
		}
		setSkills([...skills, newSkill.trim()]);
		setNewSkill("");
		toast.success("Compétence ajoutée avec succès");
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAddSkill();
		}
	};

	const handleDeleteSkill = (skill) => {
		setSkills(skills.filter((s) => s !== skill));
		toast.success("Compétence supprimée avec succès");
	};

	const handleSave = async () => {
		try {
			setIsSaving(true);
			await onSave({ skills });
			toast.success("Compétences mises à jour avec succès");
			setIsEditing(false);
		} catch (error) {
			toast.error(error.response?.data?.message || "Une erreur est survenue");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className='bg-secondary shadow rounded-lg p-6 mb-6'>
			<h2 className='text-xl font-semibold mb-4'>Compétences</h2>
			<div className='flex flex-wrap gap-2'>
				{skills.length > 0 ? (
					skills.map((skill, index) => (
						<span
							key={index}
							className='bg-base-100 text-info px-4 py-2 rounded-full text-sm flex items-center gap-2 hover:shadow-md transition-all duration-200'
						>
							{skill}
							{isEditing && (
								<button 
									onClick={() => handleDeleteSkill(skill)} 
									className='text-red-500 hover:text-red-600 transition-colors duration-200'
								>
									<X size={14} />
								</button>
							)}
						</span>
					))
				) : (
					<p className="text-info/70">Aucune compétence pour le moment</p>
				)}
			</div>

			{isEditing && (
				<div className='mt-6 p-4 rounded-lg bg-base-100'>
					<h3 className='font-semibold mb-4'>Ajouter une compétence</h3>
					<div className="flex gap-2">
						<input
							type='text'
							placeholder='Nouvelle compétence'
							value={newSkill}
							onChange={(e) => setNewSkill(e.target.value)}
							onKeyPress={handleKeyPress}
							className='flex-grow p-2 border rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary'
						/>
						<button
							onClick={handleAddSkill}
							className='bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition duration-300 flex items-center gap-2'
						>
							<Plus size={20} />
							Ajouter
						</button>
					</div>
				</div>
			)}

			{isOwnProfile && (
				<div className='mt-6'>
					{isEditing ? (
						<button
							onClick={handleSave}
							disabled={isSaving}
							className='w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition duration-300 flex items-center justify-center gap-2'
						>
							{isSaving ? (
								<>
									<Loader size={20} className="animate-spin" />
									Enregistrement...
								</>
							) : (
								"Enregistrer les modifications"
							)}
						</button>
					) : (
						<button
							onClick={() => setIsEditing(true)}
							className='w-full text-primary hover:text-primary-dark transition duration-300 flex items-center justify-center gap-2'
						>
							<Plus size={20} />
							Modifier les compétences
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default SkillsSection;

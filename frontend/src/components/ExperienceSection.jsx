import { Briefcase, X, Plus, Loader } from "lucide-react";
import { useState } from "react";
import { formatDate } from "../utils/dateUtils";
import { toast } from "react-hot-toast";

const ExperienceSection = ({ userData, isOwnProfile, onSave }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [experiences, setExperiences] = useState(userData.experience || []);
	const [newExperience, setNewExperience] = useState({
		title: "",
		company: "",
		startDate: "",
		endDate: "",
		description: "",
		currentlyWorking: false,
	});
	const [isSaving, setIsSaving] = useState(false);

	const handleAddExperience = () => {
		if (!newExperience.title.trim()) {
			toast.error("Le titre est requis");
			return;
		}
		if (!newExperience.company.trim()) {
			toast.error("L'entreprise est requise");
			return;
		}
		if (!newExperience.startDate) {
			toast.error("La date de début est requise");
			return;
		}
		if (!newExperience.currentlyWorking && !newExperience.endDate) {
			toast.error("La date de fin est requise si vous ne travaillez plus ici");
			return;
		}

		setExperiences([...experiences, { ...newExperience, _id: Date.now().toString() }]);

		setNewExperience({
			title: "",
			company: "",
			startDate: "",
			endDate: "",
			description: "",
			currentlyWorking: false,
		});

		toast.success("Expérience ajoutée avec succès");
	};

	const handleDeleteExperience = (id) => {
		setExperiences(experiences.filter((exp) => exp._id !== id));
		toast.success("Expérience supprimée avec succès");
	};

	const handleSave = async () => {
		try {
			setIsSaving(true);
			await onSave({ experience: experiences });
			toast.success("Expériences mises à jour avec succès");
			setIsEditing(false);
		} catch (error) {
			toast.error(error.response?.data?.message || "Une erreur est survenue");
		} finally {
			setIsSaving(false);
		}
	};

	const handleCurrentlyWorkingChange = (e) => {
		setNewExperience({
			...newExperience,
			currentlyWorking: e.target.checked,
			endDate: e.target.checked ? "" : newExperience.endDate,
		});
	};

	return (
		<div className='bg-secondary shadow rounded-lg p-6 mb-6'>
			<h2 className='text-xl font-semibold mb-4'>Expérience</h2>
			<div className="space-y-6">
				{experiences.map((exp) => (
					<div key={exp._id} className='flex justify-between items-start p-4 rounded-lg bg-base-100 hover:shadow-md transition-all duration-200'>
						<div className='flex items-start gap-4'>
							<Briefcase size={24} className='text-primary mt-1' />
							<div>
								<h3 className='font-semibold text-lg'>{exp.title}</h3>
								<p className='text-info'>{exp.company}</p>
								<p className='text-info/70 text-sm'>
									{formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Présent"}
								</p>
								{exp.description && (
									<p className='text-info mt-2'>{exp.description}</p>
								)}
							</div>
						</div>
						{isEditing && (
							<button 
								onClick={() => handleDeleteExperience(exp._id)} 
								className='text-red-500 hover:text-red-600 transition-colors duration-200'
							>
								<X size={20} />
							</button>
						)}
					</div>
				))}
			</div>

			{isEditing && (
				<div className='mt-6 p-4 rounded-lg bg-base-100'>
					<h3 className='font-semibold mb-4'>Ajouter une expérience</h3>
					<div className="space-y-4">
						<input
							type='text'
							placeholder='Titre du poste'
							value={newExperience.title}
							onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
							className='w-full p-2 border rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary'
						/>
						<input
							type='text'
							placeholder='Entreprise'
							value={newExperience.company}
							onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
							className='w-full p-2 border rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary'
						/>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm text-info mb-1">Date de début</label>
								<input
									type='date'
									value={newExperience.startDate}
									onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
									className='w-full p-2 border rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary'
								/>
							</div>
							{!newExperience.currentlyWorking && (
								<div>
									<label className="block text-sm text-info mb-1">Date de fin</label>
									<input
										type='date'
										value={newExperience.endDate}
										onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
										className='w-full p-2 border rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary'
									/>
								</div>
							)}
						</div>
						<div className='flex items-center'>
							<input
								type='checkbox'
								id='currentlyWorking'
								checked={newExperience.currentlyWorking}
								onChange={handleCurrentlyWorkingChange}
								className='mr-2 rounded border-gray-300 text-primary focus:ring-primary'
							/>
							<label htmlFor='currentlyWorking' className="text-info">Je travaille actuellement ici</label>
						</div>
						<textarea
							placeholder='Description'
							value={newExperience.description}
							onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
							className='w-full p-2 border rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]'
						/>
						<button
							onClick={handleAddExperience}
							className='w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition duration-300 flex items-center justify-center gap-2'
						>
							<Plus size={20} />
							Ajouter une expérience
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
							Modifier les expériences
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default ExperienceSection;

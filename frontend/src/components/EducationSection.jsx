import { School, X, Plus, Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

const EducationSection = ({ userData, isOwnProfile, onSave }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [educations, setEducations] = useState(userData.education || []);
	const [newEducation, setNewEducation] = useState({
		school: "",
		fieldOfStudy: "",
		startYear: "",
		endYear: "",
		currentlyStudying: false,
		description: "",
	});
	const [isSaving, setIsSaving] = useState(false);

	const handleAddEducation = () => {
		if (!newEducation.school.trim()) {
			toast.error("L'établissement est requis");
			return;
		}
		if (!newEducation.fieldOfStudy.trim()) {
			toast.error("Le domaine d'études est requis");
			return;
		}
		if (!newEducation.startYear) {
			toast.error("L'année de début est requise");
			return;
		}
		if (!newEducation.currentlyStudying && !newEducation.endYear) {
			toast.error("L'année de fin est requise si vous n'étudiez plus ici");
			return;
		}

		setEducations([...educations, { ...newEducation, _id: Date.now().toString() }]);

		setNewEducation({
			school: "",
			fieldOfStudy: "",
			startYear: "",
			endYear: "",
			currentlyStudying: false,
			description: "",
		});

		toast.success("Formation ajoutée avec succès");
	};

	const handleDeleteEducation = (id) => {
		setEducations(educations.filter((edu) => edu._id !== id));
		toast.success("Formation supprimée avec succès");
	};

	const handleSave = async () => {
		try {
			setIsSaving(true);
			await onSave({ education: educations });
			toast.success("Formations mises à jour avec succès");
			setIsEditing(false);
		} catch (error) {
			toast.error(error.response?.data?.message || "Une erreur est survenue");
		} finally {
			setIsSaving(false);
		}
	};

	const handleCurrentlyStudyingChange = (e) => {
		setNewEducation({
			...newEducation,
			currentlyStudying: e.target.checked,
			endYear: e.target.checked ? "" : newEducation.endYear,
		});
	};

	return (
		<div className='bg-secondary shadow rounded-lg p-6 mb-6'>
			<h2 className='text-xl font-semibold mb-4'>Formation</h2>
			<div className="space-y-6">
				{educations.map((edu) => (
					<div key={edu._id} className='flex justify-between items-start p-4 rounded-lg bg-base-100 hover:shadow-md transition-all duration-200'>
						<div className='flex items-start gap-4'>
							<School size={24} className='text-success mt-1' />
							<div>
								<h3 className='font-semibold text-lg'>{edu.fieldOfStudy}</h3>
								<p className='text-info'>{edu.school}</p>
								<p className='text-info/70 text-sm'>
									{edu.startYear} - {edu.endYear || "Présent"}
								</p>
								{edu.description && (
									<p className='text-info mt-2'>{edu.description}</p>
								)}
							</div>
						</div>
						{isEditing && (
							<button 
								onClick={() => handleDeleteEducation(edu._id)} 
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
					<h3 className='font-semibold mb-4'>Ajouter une formation</h3>
					<div className="space-y-4">
						<input
							type='text'
							placeholder='Établissement'
							value={newEducation.school}
							onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
							className='w-full p-2 border rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-success'
						/>
						<input
							type='text'
							placeholder='Domaine d\'études'
							value={newEducation.fieldOfStudy}
							onChange={(e) => setNewEducation({ ...newEducation, fieldOfStudy: e.target.value })}
							className='w-full p-2 border rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-success'
						/>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm text-info mb-1">Année de début</label>
								<input
									type='number'
									value={newEducation.startYear}
									onChange={(e) => setNewEducation({ ...newEducation, startYear: e.target.value })}
									className='w-full p-2 border rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-success'
								/>
							</div>
							{!newEducation.currentlyStudying && (
								<div>
									<label className="block text-sm text-info mb-1">Année de fin</label>
									<input
										type='number'
										value={newEducation.endYear}
										onChange={(e) => setNewEducation({ ...newEducation, endYear: e.target.value })}
										className='w-full p-2 border rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-success'
									/>
								</div>
							)}
						</div>
						<div className='flex items-center'>
							<input
								type='checkbox'
								id='currentlyStudying'
								checked={newEducation.currentlyStudying}
								onChange={handleCurrentlyStudyingChange}
								className='mr-2 rounded border-gray-300 text-success focus:ring-success'
							/>
							<label htmlFor='currentlyStudying' className="text-info">J'étudie actuellement ici</label>
						</div>
						<textarea
							placeholder='Description'
							value={newEducation.description}
							onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
							className='w-full p-2 border rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-success min-h-[100px]'
						/>
						<button
							onClick={handleAddEducation}
							className='w-full bg-success text-white py-2 px-4 rounded-lg hover:bg-success-dark transition duration-300 flex items-center justify-center gap-2'
						>
							<Plus size={20} />
							Ajouter une formation
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
							className='w-full bg-success text-white py-2 px-4 rounded-lg hover:bg-success-dark transition duration-300 flex items-center justify-center gap-2'
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
							className='w-full text-success hover:text-success-dark transition duration-300 flex items-center justify-center gap-2'
						>
							<Plus size={20} />
							Modifier les formations
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default EducationSection;

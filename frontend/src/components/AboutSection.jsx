import { useState } from "react";
import { Edit2, Loader } from "lucide-react";
import { toast } from "react-hot-toast";

const AboutSection = ({ userData, isOwnProfile, onSave }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [about, setAbout] = useState(userData.about || "");
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		try {
			setIsSaving(true);
			await onSave({ about });
			toast.success("À propos mis à jour avec succès");
			setIsEditing(false);
		} catch (error) {
			toast.error(error.response?.data?.message || "Une erreur est survenue");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className='bg-secondary shadow rounded-lg p-6 mb-6'>
			<h2 className='text-xl font-semibold mb-4'>À propos</h2>
			{isOwnProfile ? (
				<>
					{isEditing ? (
						<div className="space-y-4">
							<textarea
								value={about}
								onChange={(e) => setAbout(e.target.value)}
								className='w-full p-4 border rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-success min-h-[150px]'
								placeholder="Parlez-nous de vous..."
							/>
							<div className="flex gap-2">
								<button
									onClick={handleSave}
									disabled={isSaving}
									className='flex-1 bg-success text-white py-2 px-4 rounded-lg hover:bg-success-dark transition duration-300 flex items-center justify-center gap-2'
								>
									{isSaving ? (
										<>
											<Loader size={20} className="animate-spin" />
											Enregistrement...
										</>
									) : (
										"Enregistrer"
									)}
								</button>
								<button
									onClick={() => {
										setAbout(userData.about || "");
										setIsEditing(false);
									}}
									className='flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300'
								>
									Annuler
								</button>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							<p className="text-info whitespace-pre-wrap">{userData.about || "Aucune description pour le moment."}</p>
							<button
								onClick={() => setIsEditing(true)}
								className='text-success hover:text-success-dark transition duration-300 flex items-center gap-2'
							>
								<Edit2 size={20} />
								Modifier
							</button>
						</div>
					)}
				</>
			) : (
				<p className="text-info whitespace-pre-wrap">{userData.about || "Aucune description pour le moment."}</p>
			)}
		</div>
	);
};

export default AboutSection;

export default function PostAction({ icon, text, onClick, disabled = false }) {
	return (
		<button 
			className='flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-base-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed' 
			onClick={onClick}
			disabled={disabled}
		>
			<span>{icon}</span>
			<span className='hidden sm:inline text-sm'>{text}</span>
		</button>
	);
}

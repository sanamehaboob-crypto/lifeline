export default function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="relative">
        <div className={`${sizes[size]} border-4 border-white/10 border-t-primary-500 rounded-full animate-spin`} />
      </div>
      {text && <p className="mt-4 text-sm text-gray-400 animate-pulse">{text}</p>}
    </div>
  );
}

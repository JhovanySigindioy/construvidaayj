export default function LoadingButton({ label = "Cargando..." }: { label?: string }) {
    return (
        <button
            type="button"
            className="w-full py-2 rounded-full bg-indigo-400 text-white font-semibold shadow-md hover:cursor-not-allowed duration-300"
            disabled
        >
            <div className="flex items-center justify-center">
                <div className="h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-white border-4"></div>
                <span className="ml-2">{label}</span>
            </div>
        </button>
    );
}
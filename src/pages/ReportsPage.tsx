import { MdConstruction } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { FaTools } from 'react-icons/fa';
import { AiFillAlert, AiOutlineWarning } from 'react-icons/ai';

export default function ReportsPage() {
  return (
    <div className="fade-in min-h-[89vh] bg-gradient-to-br from-gray-100 to-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-12 max-w-2xl w-full text-center">
        <div className="mb-6 flex justify-center">
          <MdConstruction size={100} className="text-blue-500" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
          Sitio en Construcción
        </h1>
        <p className="text-gray-700 text-lg sm:text-xl mb-6">
          Estamos trabajando para traerte algo increíble. ¡Vuelve pronto!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <div className="bg-blue-100/50 border border-blue-200 rounded-full px-4 py-2 flex items-center gap-2">
            <FaTools className="w-4 h-4 text-blue-400" />
            <span className="text-blue-700 text-sm">Mantenimiento</span>
          </div>
          <div className="bg-green-100/50 border border-green-200 rounded-full px-4 py-2 flex items-center gap-2">
            <AiFillAlert className="w-4 h-4 text-green-400" />
            <span className="text-green-700 text-sm">Mejorando la Experiencia</span>
          </div>
          <div className="bg-yellow-100/50 border border-yellow-200 rounded-full px-4 py-2 flex items-center gap-2">
            <AiOutlineWarning className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-700 text-sm">Estamos Casi Listos</span>
          </div>
        </div>
        <Link
          to="/"
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}

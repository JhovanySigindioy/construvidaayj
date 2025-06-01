// src/components/Navbar.tsx

import { useState } from 'react'; // No necesitamos useEffect aquí para officeSelected
import { FaBars, FaTimes } from 'react-icons/fa';
import { LuLogOut } from "react-icons/lu";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importa useAuth

export default function Navbar() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    // Consumimos los estados del contexto
    const { isAuthenticated, logout, selectedOfficeId } = useAuth(); // <--- CAMBIO AQUÍ

    // `officeSelected` ahora se deriva directamente de `selectedOfficeId` del contexto
    const officeIsTrulySelected = selectedOfficeId !== null && selectedOfficeId !== "" && selectedOfficeId !== undefined;

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    const handleLogout = () => {
        // useAuth().logout() ya se encarga de limpiar localStorage
        logout(); 
        closeMenu();
        navigate('/login');
    };

    const isActive = (path: string) =>
        pathname === path ? 'text-emerald-500 font-semibold' : 'hover:text-emerald-500 transition-colors';

    return (
        <nav className="bg-white text-gray-800 font-sans p-2 flex items-center justify-between relative shadow-md text-sm">
            <div className="flex w-full items-center justify-between mx-6 md:mx-20">
                <div className="flex items-center space-x-2">
                    <Link to="/">
                        <img src="/logoFinal.png" alt="Logo CONTRUVIDA AYJ" className="h-14 w-auto" />
                    </Link>
                </div>

                {/* Menú para pantallas grandes (Desktop) */}
                <ul className="hidden md:flex space-x-6 text-lg items-center">
                    {/* El enlace de Oficinas siempre visible */}
                    <li><Link to="/office_select" className={isActive('/office_select')}>Oficinas</Link></li>

                    {/* Las demás opciones solo si hay una oficina seleccionada desde el contexto */}
                    {officeIsTrulySelected && ( // <--- CAMBIO AQUÍ
                        <>
                            <li><Link to="/customer_management" className={isActive('/customer_management')}>Afiliaciones</Link></li>
                            <li><Link to="/unsubscriptions" className={isActive('/unsubscriptions')}>Retirados</Link></li>
                            <li><Link to="/reports" onClick={closeMenu} className={isActive('/reports')}>Reportes</Link></li>
                        </>
                    )}

                    {isAuthenticated && (
                        <li>
                            <button
                                onClick={handleLogout}
                                className="text-red-600 hover:bg-red-50/50 hover:text-red-700 transition-colors w-full text-left flex items-center py-2"
                                title="Cerrar sesión"
                            >
                                <LuLogOut className="w-5 h-5 mr-2" /> <span className="font-medium">Salir</span>
                            </button>
                        </li>
                    )}
                </ul>
            </div>

            <button
                onClick={toggleMenu}
                className="md:hidden text-2xl focus:outline-none z-50"
                aria-label="Abrir menú"
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
            >
                {isOpen ? <FaTimes /> : <FaBars />}
            </button>

            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-30 ${isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={closeMenu}
            />

            {/* Menú para pantallas pequeñas (Mobile) */}
            <div
                id="mobile-menu"
                className={`fixed top-0 left-0 h-full w-64 bg-white text-gray-800 p-6 transform transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="text-center mb-8 bg-danger">
                    <img src="/logoConstruvida.png" alt="Logo" width={140} height={20} className="mx-auto" />
                </div>

                <ul className="flex flex-col space-y-5 text-lg font-medium">
                    {/* El enlace de Oficinas siempre visible en móvil */}
                    <li><Link to="/office_select" onClick={closeMenu} className={isActive('/office_select')}>Oficinas</Link></li>

                    {/* Las demás opciones solo si hay una oficina seleccionada en móvil */}
                    {officeIsTrulySelected && ( // <--- CAMBIO AQUÍ
                        <>
                            <li><Link to="/customer_management" onClick={closeMenu} className={isActive('/customer_management')}>Gestión de Clientes</Link></li>
                            <li><Link to="/unsubscriptions" onClick={closeMenu} className={isActive('/unsubscriptions')}>Retirados</Link></li>
                            <li><Link to="/reports" onClick={closeMenu} className={isActive('/reports')}>Reportes</Link></li>
                        </>
                    )}

                    {isAuthenticated && (
                        <li>
                            <button
                                onClick={handleLogout}
                                className="text-red-600 hover:bg-red-50/50 hover:text-red-700 transition-colors w-full text-left flex items-center py-2"
                                title="Cerrar sesión"
                            >
                                <LuLogOut className="w-5 h-5 mr-2" /> <span className="font-medium">Salir</span>
                            </button>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}
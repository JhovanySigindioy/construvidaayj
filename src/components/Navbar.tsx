// src/components/Navbar.tsx

import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { LuLogOut } from "react-icons/lu";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, logout, selectedOfficeId, user } = useAuth();

    // Verificamos si hay una oficina seleccionada de manera estricta
    const officeIsTrulySelected = selectedOfficeId !== null && selectedOfficeId !== "" && selectedOfficeId !== undefined;

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    const handleLogout = () => {
        logout();
        closeMenu();
        navigate('/login');
    };

    // Función para obtener la clase de estilo activa/inactiva de los enlaces
    const isActive = (path: string) =>
        pathname === path
            ? 'text-emerald-500 font-semibold' // Color verde y negrita para el enlace activo
            : 'text-gray-700 hover:text-emerald-500 transition-colors duration-200'; // Color gris, cambia a verde al pasar el ratón

    // Función para obtener las iniciales del nombre de usuario
    const getInitials = (username: string | undefined): string => {
        if (!username) return 'UU'; // Default to "Unknown User" or similar
        const parts = username.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return username[0].toUpperCase();
    };

    return (
        <nav className="bg-white text-gray-800 font-sans p-4 shadow-md sticky top-0 z-50"> {/* sticky y p-4 para mejor padding */}
            <div className="container mx-auto flex items-center justify-between"> {/* Contenedor centrado para desktop */}
                {/* Logo e Items del menú principal */}
                <div className="flex items-center space-x-6"> {/* Ajuste de espacio */}
                    <Link to="/" onClick={closeMenu}>
                        <img src="/logoFinal.png" alt="Logo CONTRUVIDA AYJ" className="h-10 md:h-12 w-auto" /> {/* Logo un poco más pequeño en móvil */}
                    </Link>

                    {/* Menú de navegación principal (visible solo en desktop) */}
                    <ul className="hidden md:flex space-x-6 text-sm font-medium"> {/* md:flex para mostrar en desktop */}
                        <li><Link to="/office_select" className={isActive('/office_select')}>Oficinas</Link></li>
                        {officeIsTrulySelected && (
                            <>
                                <li><Link to="/customer_management" className={isActive('/customer_management')}>Afiliaciones</Link></li>
                                <li><Link to="/unsubscriptions" className={isActive('/unsubscriptions')}>Retirados</Link></li>
                                <li><Link to="/reports" className={isActive('/reports')}>Reportes</Link></li>
                            </>
                        )}
                    </ul>
                </div>

                {/* Sección de usuario y logout (visible en desktop) */}
                <div className="hidden md:flex items-center space-x-4"> {/* hidden md:flex para mostrar en desktop */}
                    {isAuthenticated && (
                        <>
                            <div className="flex items-center space-x-2">
                                {/* Avatar de letras mejorado */}
                                <div
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs"
                                    title={user?.username || 'Usuario'}
                                >
                                    {getInitials(user?.username)}
                                </div>
                                <span className="text-gray-700 text-sm font-medium hidden lg:inline">{user?.username}</span> {/* Oculta nombre completo en pantallas medianas, visible en grandes */}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors duration-200 rounded-lg px-3 py-2 flex items-center text-sm"
                                title="Cerrar sesión"
                            >
                                <LuLogOut className="w-4 h-4 mr-1 md:mr-2" /> <span className="font-medium">Salir</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Botón de Hamburguesa (visible solo en móvil) */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden text-gray-700 text-2xl focus:outline-none z-50 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Abrir menú"
                    aria-expanded={isOpen}
                    aria-controls="mobile-menu"
                >
                    {isOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Overlay Oscuro para el menú móvil */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-30 ${isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={closeMenu}
            />

            {/* Menú para pantallas pequeñas (Mobile - Sidebar) */}
            <div
                id="mobile-menu"
                className={`fixed top-0 left-0 h-full w-64 bg-white text-gray-800 p-6 transform transition-transform duration-300 ease-in-out z-40 shadow-xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="text-center mb-8 pb-4 border-b border-gray-200"> {/* Separador y padding */}
                    <img src="/logoFinal.png" alt="Logo CONTRUVIDA AYJ" className="mx-auto h-12 w-auto" /> {/* Logo consistente */}
                    {isAuthenticated && user?.username && (
                        <div className="mt-4 text-gray-700 font-semibold">
                            Bienvenido, {user.username.split(' ')[0]} {/* Muestra solo el primer nombre */}
                        </div>
                    )}
                </div>

                <ul className="flex flex-col space-y-4 text-base font-medium"> {/* Espaciado y tamaño de fuente ajustados */}
                    <li>
                        <Link
                            to="/office_select"
                            onClick={closeMenu}
                            className={`${isActive('/office_select')} block py-2 px-3 rounded-md hover:bg-gray-50`}
                        >
                            Oficinas
                        </Link>
                    </li>

                    {officeIsTrulySelected && (
                        <>
                            <li>
                                <Link
                                    to="/customer_management"
                                    onClick={closeMenu}
                                    className={`${isActive('/customer_management')} block py-2 px-3 rounded-md hover:bg-gray-50`}
                                >
                                    Afiliaciones
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/unsubscriptions"
                                    onClick={closeMenu}
                                    className={`${isActive('/unsubscriptions')} block py-2 px-3 rounded-md hover:bg-gray-50`}
                                >
                                    Retirados
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/reports"
                                    onClick={closeMenu}
                                    className={`${isActive('/reports')} block py-2 px-3 rounded-md hover:bg-gray-50`}
                                >
                                    Reportes
                                </Link>
                            </li>
                        </>
                    )}

                    {isAuthenticated && (
                        <li className="border-t border-gray-200 pt-4 mt-4"> {/* Separador para el botón de salir */}
                            <button
                                onClick={handleLogout}
                                className="text-red-600 hover:bg-red-50/50 hover:text-red-700 transition-colors duration-200 w-full text-left flex items-center py-2 px-3 rounded-md"
                                title="Cerrar sesión"
                            >
                                <LuLogOut className="w-5 h-5 mr-3" /> <span className="font-medium">Salir</span>
                            </button>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}
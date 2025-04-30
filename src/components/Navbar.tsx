import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa'; // Importa el ícono de salida
import { LuLogOut } from "react-icons/lu";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, logout } = useAuth();

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    const handleLogout = () => {
        logout();
        closeMenu();
        navigate('/login');
    };

    const isActive = (path: string) =>
        pathname === path ? 'text-emerald-500 font-semibold' : 'hover:text-emerald-500 transition-colors';

    return (
        <nav className="bg-white text-gray-800 font-sans p-4 flex items-center justify-between relative shadow-md">
            <div className="flex w-full items-center justify-between mx-6 md:mx-20">
                <div className="text-2xl font-bold tracking-wide">
                    <Link to="/" className="hover:text-emerald-500 transition-colors">CONTRUVIDA AYJ</Link>
                </div>

                <ul className="hidden md:flex space-x-6 text-lg items-center">

                    <li><Link to="/office_select" className={isActive('/office_select')}>Seleccionar Oficina</Link></li>
                    <li><Link to="/customer_management" className={isActive('/customer_management')}>Gestión de Clientes</Link></li>
                    {isAuthenticated && (
                        <li>
                            <button
                                onClick={handleLogout}
                                className="text-red-700 p-2 rounded-b-md border-b-2 hover:shadow-md"
                                title="Cerrar sesión"
                            >
                                <LuLogOut />
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

            <div
                id="mobile-menu"
                className={`fixed top-0 left-0 h-full w-64 bg-white text-gray-800 p-6 transform transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="text-center mb-8 bg-danger">
                    <img src="/logoConstruvida.png" alt="Logo" width={140} height={20} className="mx-auto" />
                </div>

                <ul className="flex flex-col space-y-5 text-lg font-medium">

                    <li><Link to="/office_select" onClick={closeMenu} className={isActive('/office_select')}>Seleccionar Oficina</Link></li>
                    <li><Link to="/customer_management" onClick={closeMenu} className={isActive('/customer_management')}>Gestión de Clientes</Link></li>
                    {isAuthenticated && (
                        <li>
                            <button
                                onClick={handleLogout}
                                className="text-red-700 p-2 rounded-b-md border-b-2 hover:shadow-md"
                                title="Cerrar sesión"
                            >
                                <LuLogOut />
                            </button>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}

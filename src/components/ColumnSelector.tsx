// app/components/ColumnSelector.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FiColumns } from 'react-icons/fi'; // Importa el icono de columnas

interface ColumnSelectorProps<T extends object> {
    visibleHeaders: (keyof T)[];
    setVisibleHeaders: React.Dispatch<React.SetStateAction<(keyof T)[]>>;
    headerLabels: Record<keyof T, string>;
}

export default function ColumnSelector<T extends object>({
    visibleHeaders,
    setVisibleHeaders,
    headerLabels,
}: ColumnSelectorProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const allHeaders = Object.keys(headerLabels) as (keyof T)[];
    const allVisible = visibleHeaders.length === allHeaders.length;
    const selectorRef = useRef<HTMLDivElement>(null);

    const toggleHeader = (header: keyof T) => {
        setVisibleHeaders((prevHeaders: (keyof T)[]) =>
            prevHeaders.includes(header)
                ? prevHeaders.filter((h: keyof T) => h !== header)
                : [...prevHeaders, header]
        );
    };

    const toggleAll = () => {
        setVisibleHeaders(allVisible ? [] : allHeaders);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const { pathname } = useLocation();
    const buttonClass = pathname === "/customer_management"
        ? "bg-sky-400 hover:bg-sky-600"
        : pathname === "/unsubscriptions"
            ? "bg-red-800 hover:bg-red-600"
            : "bg-gray-700 hover:bg-gray-600"; // Color por defecto más oscuro

    return (
        <div className="relative inline-block" ref={selectorRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center p-2 rounded-md text-white font-semibold ${buttonClass} 
                           transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-opacity-50
                           sm:px-4 sm:py-2 sm:text-sm sm:w-auto sm:h-10 w-14 h-14`} // Ajuste de tamaño para móvil
                aria-haspopup="true"
            >
                {/* Oculta el icono en sm (desktop) y muestra el texto, viceversa para móvil */}
                <span className="sm:hidden">
                    <FiColumns className="w-5 h-5" />
                </span>
                <span className="hidden sm:inline">
                    Mostrar columnas
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-20 mt-2 w-64 max-h-80 overflow-y-auto 
                            border-2 border-gray-300 rounded-md shadow-lg bg-gray-50 p-3
                            "> {/* Posicionamiento responsivo */}
                    <button
                        onClick={toggleAll}
                        className="text-gray-600 font-semibold mb-2 text-xs sm:text-sm hover:underline w-full text-left"
                    >
                        {allVisible ? 'Ocultar todo 🙈 ' : 'Mostrar todo 👁️'}
                    </button>

                    <ul className="space-y-1 text-sm">
                        {allHeaders.map((header) => (
                            <li
                                key={header as string}
                                onClick={() => toggleHeader(header)}
                                className="flex items-center hover:bg-gray-200 p-1 rounded cursor-pointer"
                            >
                                <input
                                    id={header as string}
                                    type="checkbox"
                                    checked={visibleHeaders.includes(header)}
                                    readOnly
                                    className="mr-2 pointer-events-none"
                                    aria-checked={visibleHeaders.includes(header)}
                                />
                                <span>{headerLabels[header]}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
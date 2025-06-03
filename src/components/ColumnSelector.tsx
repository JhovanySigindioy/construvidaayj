import React, { useState, useEffect, useRef } from 'react'; // Importa useRef
import { useLocation } from 'react-router-dom';

interface ColumnSelectorProps<T extends object> {
  visibleHeaders: (keyof T)[];
  setVisibleHeaders: React.Dispatch<React.SetStateAction<(keyof T)[]>>;
  headerLabels: Record<keyof T, string>;
}

export default function ColumnSelector<T extends object>({ // <--- ¡Añadir <T extends object> aquí!
  visibleHeaders,
  setVisibleHeaders,
  headerLabels,
}: ColumnSelectorProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const allHeaders = Object.keys(headerLabels) as (keyof T)[];
  const allVisible = visibleHeaders.length === allHeaders.length;
  const selectorRef = useRef<HTMLDivElement>(null); // Referencia al contenedor del componente

  const toggleHeader = (header: keyof T) => {
    setVisibleHeaders((prevHeaders: (keyof T)[]) => // <--- Aquí el cambio
      prevHeaders.includes(header)
        ? prevHeaders.filter((h: keyof T) => h !== header) // <--- Y aquí el cambio
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
      : "bg-gray-200 text-black";
  return (
    <div className="relative inline-block" ref={selectorRef}> {/* Asignamos la referencia al div */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className= {`px-4 py-2 rounded-md text-sm font-semibold text-white ${buttonClass} transition-colors duration-150 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50`}
        aria-haspopup="true"
      >
        Mostrar columnas
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 max-h-64 overflow-y-auto border-2 border-gray-300 rounded-md shadow-md bg-gray-50 p-3">
          <button
            onClick={toggleAll}
            className="text-gray-400 font-semibold mb-2 text-sm hover:underline"
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
import React, { useState } from 'react';
import { DataClient } from '../types/dataClient';


interface ColumnSelectorProps {
    visibleHeaders: (keyof DataClient)[];
    setVisibleHeaders: React.Dispatch<React.SetStateAction<(keyof DataClient)[]>>;
    headerLabels: Record<keyof DataClient, string>;
}

export default function ColumnSelector({
    visibleHeaders,
    setVisibleHeaders,
    headerLabels,
}: ColumnSelectorProps) {
    const [isOpen, setIsOpen] = useState(false); // Para abrir/cerrar la lista
    const allHeaders = Object.keys(headerLabels) as (keyof DataClient)[];
    const allVisible = visibleHeaders.length === allHeaders.length;

    const toggleHeader = (header: keyof DataClient) => {
        setVisibleHeaders(prevHeaders =>
            prevHeaders.includes(header)
                ? prevHeaders.filter((h) => h !== header)
                : [...prevHeaders, header]
        );
    };

    const toggleAll = () => {
        setVisibleHeaders(allVisible ? [] : allHeaders);
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-sky-400 text-white px-4 py-2 rounded-md shadow hover:bg-sky-600"
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
                                key={header}
                                onClick={() => toggleHeader(header)}
                                className="flex items-center hover:bg-gray-200 p-1 rounded cursor-pointer"
                            >
                                <input
                                    id={header}
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
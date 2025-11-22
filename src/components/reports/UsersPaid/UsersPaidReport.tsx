// src/components/UsersPaidReport.tsx
import React, { useState, useMemo } from 'react';
import NewUsersTable from './NewUsersTable';
import OldUsersTable from './OldUsersTable';
// Asumiendo que están en la misma carpeta o ajusta la ruta


// Mock de opciones de oficina. En una aplicación real, esto vendría de una API o un contexto global.
const mockOfficeOptions = [
    { id: 3, name: 'Juliana Perez' },
    { id: 2, name: 'Salud Proactiva' },
    { id: 1, name: 'Construvida AYJ' },
];

export default function UsersPaidReport() {
    const today = new Date();
    // Formatea la fecha actual a YYYY-MM-DD
    const [selectedDate, setSelectedDate] = useState<string>(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    );
    const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);

    // Deriva el año, mes y día de la fecha seleccionada para pasarlos a los hooks
    const [year, month, day] = useMemo(() => {
        const parts = selectedDate.split('-').map(Number);
        return [parts[0], parts[1], parts[2]];
    }, [selectedDate]);

    // Prepara los parámetros para los hooks, incluyendo un valor predeterminado de 0 para office_id si no hay selección
    const commonQueryParams = useMemo(() => ({
        day,
        month,
        year,
        office_id: selectedOfficeId ?? 0, // Usamos 0 si no hay oficina seleccionada, asumiendo que tu API lo maneja así.
    }), [day, month, year, selectedOfficeId]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    const handleOfficeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedOfficeId(value === '' ? null : Number(value));
    };

    return (
        <div className="w-full max-w-screen-2xl mx-auto px-4 py-4 mb-10 lg:px-12 border border-gray-200 rounded-md">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-1 text-center">Reporte de Afiliaciones y Pagos</h2>

            {/* Selectores de Fecha y Oficina - Centralizados aquí */}
            <div className="bg-white p-6 rounded-lg mb-1 flex flex-col sm:flex-row gap-6 justify-center items-center">
                {/* Selector de Fecha */}
                <div>
                    <label htmlFor="report-date" className="block text-sm font-medium text-gray-700 mb-1">
                        Selecciona Fecha:
                    </label>
                    <input
                        id="report-date"
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="border border-gray-300 rounded px-4 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Selector de Oficina */}
                <div>
                    <label htmlFor="office-select" className="block text-sm font-medium text-gray-700 mb-1">
                        Selecciona Oficina:
                    </label>
                    <select
                        id="office-select"
                        value={selectedOfficeId ?? ''}
                        onChange={handleOfficeChange}
                        className="border border-gray-300 rounded px-4 py-2 shadow-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">-- Selecciona una oficina --</option>
                        {mockOfficeOptions.map((office) => (
                            <option key={office.id} value={office.id}>
                                {office.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Sección de Usuarios Nuevos */}
            <div className="mb-10">
                <h3 className="text-xl font-bold text-gray-800 hover:text-green-500 mb-4">Usuarios Nuevos (Afiliaciones del día)</h3>
                <NewUsersTable
                    queryParams={commonQueryParams}
                    officeSelected={selectedOfficeId !== null} // Pasa un prop para indicar si hay oficina seleccionada
                    dateSelected={!!selectedDate} // Pasa un prop para indicar si hay fecha seleccionada
                />
            </div>

            {/* Sección de Usuarios Antiguos */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 hover:text-yellow-500 mb-4">Usuarios Antiguos (Pagos del día)</h3>
                <OldUsersTable
                    queryParams={commonQueryParams}
                    officeSelected={selectedOfficeId !== null}
                    dateSelected={!!selectedDate}
                />
            </div>
        </div>
    );
}
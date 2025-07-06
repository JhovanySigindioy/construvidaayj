import { Button } from "@headlessui/react";
import { TableProps } from "../interfaces/tableProps";
import { useLocation } from "react-router-dom";

export default function Table<T extends Record<string, any>>({
    headers,
    headerLabels = {},
    data,
    cellRenderers = {},
    rowActions,
    idKey, // Nueva propiedad: la clave a usar para identificar cada fila
}: TableProps<T>) {
    const { pathname } = useLocation();
    const theadClass = pathname === "/customer_management"
        ? "bg-blue-400 text-white"
        : pathname === "/unsubscriptions"
            ? "bg-red-800 text-white semibold"
            : "bg-gray-200 text-black";

    // Función para obtener la clave única de la fila
    const getRowKey = (row: T, index: number) => {
        // Si se proporciona un idKey, úsalo. Asegúrate de que el valor exista y sea único.
        if (idKey && row[idKey] !== undefined && row[idKey] !== null) {
            return String(row[idKey]);
        }
        // Como fallback, si 'id' existe en el objeto (común para IDs de DB), úsalo.
        // Esto es útil si no siempre se especifica idKey y 'id' es el campo por defecto.
        if (row.id !== undefined && row.id !== null) {
            return String(row.id);
        }
        // Último recurso: usar el índice. Esto es desaconsejado para listas que cambian de orden,
        // pero es un fallback si no hay otra clave única disponible.
        console.warn("Table: No se encontró una clave única para la fila. Usando el índice. Considera proporcionar un 'idKey' o asegurar que las filas tengan una propiedad 'id' o 'affiliationId' única.");
        return `row-${index}`; // Clave de respaldo con índice
    };

    return (
        <div className="overflow-x-auto fade-in rounded-md border border-gray-200 bg-white/80 backdrop-blur-sm">
            <table className="min-w-full text-[12px] text-gray-700">
                <thead className={theadClass + " sticky top-0 z-10"}>
                    <tr>
                        {rowActions && (
                            <th className="px-1 md:px-6 py-4 text-left font-bold tracking-wide border-b border-gray-300">Acciones</th>
                        )}
                        {headers.map((header) => (
                            <th key={String(header)} className="px-1 md:px-6 py-4 text-left font-bold tracking-wide whitespace-nowrap border-b border-gray-300">
                                {String(headerLabels[header] || header)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr key="no-data-row">
                            <td
                                colSpan={headers.length + (rowActions ? 1 : 0)}
                                className="px-4 py-8 text-center text-gray-400 italic bg-gray-50"
                            >
                                No hay datos disponibles.
                            </td>
                        </tr>
                    ) : (
                        data.map((row, index) => ( // Añadimos 'index' aquí
                            <tr
                                key={getRowKey(row, index)} // Usamos la función getRowKey
                                className="transition-colors duration-150 hover:bg-slate-100 even:bg-gray-50 odd:bg-white border-b border-gray-100"
                            >
                                {rowActions && (
                                    <td className="px-1 md:px-6 py-3 align-middle">{rowActions(row)}</td>
                                )}
                                {headers.map((header) => (
                                    <td
                                        key={String(header)} className="px-1 md:px-6 py-3 align-middle">
                                        {
                                            cellRenderers[header]
                                                ? cellRenderers[header]!(row[header], row)
                                                :
                                                (
                                                    <span className={row[header] === null || row[header] === undefined ? 'p-1 bg-red-200 text-red-600 rounded-lg': ''}>
                                                        {row[header] ?? 'N/A'}
                                                    </span>
                                                )
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

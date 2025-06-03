import { TableProps } from "../interfaces/tableProps";
import { useLocation } from "react-router-dom";


export default function Table<T extends Record<string, any>>({
    headers,
    headerLabels = {},
    data,
    cellRenderers = {},
    rowActions,
}: TableProps<T>) {
    const { pathname } = useLocation();
    const theadClass = pathname === "/customer_management"
        ? "bg-blue-400 text-white"
        : pathname === "/unsubscriptions"
            ? "bg-red-800 text-white semibold"
            : "bg-gray-200 text-black";
    return (
        <div className="overflow-x-auto fade-in">
            <table className="min-w-full text-[12px] text-gray-600 shadow-md rounded-lg overflow-hidden bg-white border border-gray-200">
                <thead className={theadClass}>
                    <tr>
                        {headers.map((header) => (
                            <th key={String(header)} className="px-4 py-3 text-left font-semibold tracking-wide">
                                {String(headerLabels[header] || header)}
                            </th>
                        ))}
                        {rowActions && (
                            <th className="px-4 py-3 text-left font-semibold tracking-wide">Acciones</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={headers.length + (rowActions ? 1 : 0)}
                                className="px-4 py-6 text-center text-gray-500 italic"
                            >
                                No hay datos disponibles.
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => (
                            <tr
                                // RECOMENDACIÓN: Usa un ID único de la fila como 'key' si está disponible (ej. row.id, row.affiliationId).
                                // Usar el 'index' es un antipatrón si la lista puede cambiar de orden, añadirse/eliminarse elementos.
                                // Ejemplo: key={row.affiliationId || index}
                                key={row.id} // Mantenemos 'index' como está si no hay un ID único garantizado.
                                className="transition-colors duration-200 hover:bg-gray-100 even:bg-gray-50"
                            >
                                {headers.map((header) => (
                                    <td key={String(header)} className="px-4 py-3 border-t border-gray-200">
                                        {/* No es necesario el '!' aquí, ya que la condición de existencia lo garantiza */}
                                        {cellRenderers[header]
                                            ? cellRenderers[header]!(row[header], row) // Mantenemos el '!' si estás seguro de que no será null/undefined después de la verificación
                                            : String(row[header])}
                                    </td>
                                ))}
                                {rowActions && (
                                    <td className="px-4 py-3 border-t border-gray-200">
                                        {rowActions(row)}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
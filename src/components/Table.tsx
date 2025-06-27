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
        <div className="overflow-x-auto fade-in rounded-md  border border-gray-200 bg-white/80 backdrop-blur-sm">
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
                        <tr>
                            <td
                                colSpan={headers.length + (rowActions ? 1 : 0)}
                                className="px-4 py-8 text-center text-gray-400 italic bg-gray-50"
                            >
                                No hay datos disponibles.
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => (
                            <tr
                                key={row.id}
                                className="transition-colors duration-150 hover:bg-slate-100 even:bg-gray-50 odd:bg-white border-b border-gray-100"
                            >
                                {rowActions && (
                                    <td className="px-1 md:px-6 py-3 align-middle">{rowActions(row)}</td>
                                )}
                                {headers.map((header) => (
                                    <td key={String(header)} className="px-1 md:px-6 py-3 align-middle">
                                        {cellRenderers[header]
                                            ? cellRenderers[header]!(row[header], row)
                                            : String(row[header])}
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
import { TableProps } from "../interfaces/tableProps";

export default function Table<T extends Record<string, unknown>>({
  headers,
  headerLabels = {},
  data,
  cellRenderers = {},
  rowActions,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-[13px] text-gray-800 shadow-md rounded-lg overflow-hidden bg-white border border-gray-200">
        <thead className="bg-blue-400 text-white">
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
            data.map((row, index) => (
              <tr
                key={index}
                className="transition-colors duration-200 hover:bg-gray-100 even:bg-gray-50"
              >
                {headers.map((header) => (
                  <td key={String(header)} className="px-4 py-3 border-t border-gray-200">
                    {cellRenderers[header]
                      ? cellRenderers[header]!(row[header], row)
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


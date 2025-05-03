import { GlobalFilterProps } from "../interfaces/globalFilterProps";

export default function GlobalFilter({
  filterText,
  onFilterChange,
  placeholder = 'Buscar...',
  selectedColumn,
  onColumnChange,
  columnOptions
}: GlobalFilterProps) {
  return (
    <div className="relative my-6 mx-4 border border-gray-300 rounded-lg p-1 shadow-sm bg-white w-full md:w-auto">

      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-sm text-gray-600 font-medium">
        Filtrar por
      </span>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <select
          value={selectedColumn}
          onChange={(e) => onColumnChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {columnOptions.map((col) => (
            <option key={col.key} value={col.key}>
              {col.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={filterText}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder={placeholder}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </div>
  );
}
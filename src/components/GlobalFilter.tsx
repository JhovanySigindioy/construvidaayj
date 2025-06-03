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

    <div className="relative border border-gray-300 rounded-lg p-2 shadow-sm bg-white">


      <span className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-600 font-medium">
        Filtrar por
      </span>

      <div className="flex flex-row gap-2 md:gap-4 items-center">
        {/* Selector de columna */}
        <select
          value={selectedColumn}
          onChange={(e) => onColumnChange(e.target.value)}
          className="
            w-full
            md:w-auto
            px-3 py-2 border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-400
            text-base sm:text-sm
          "
        >
          {columnOptions.map((col) => (
            <option key={col.key} value={col.key}>
              {col.label}
            </option>
          ))}
        </select>

        {/* Campo de búsqueda de texto */}
        <input
          type="text"
          value={filterText}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full
            md:w-auto
            px-3 py-2 border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-400
            text-base sm:text-sm
            "
        />
      </div>
    </div>
  );
}
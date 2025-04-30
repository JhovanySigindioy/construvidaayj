import { PaginationProps } from "../interfaces/paginationProps";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex justify-center items-center gap-3 my-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 border border-blue-500 text-blue-500 rounded  hover:bg-blue-500 hover:text-white transition duration-150"
      >
      {"<<"}
      </button>
      <span className="text-sm text-gray-400">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 border border-blue-500 text-blue-500 rounded  hover:bg-blue-500 hover:text-white transition duration-150"
      >
      {">>"}
      </button>
    </div>
  );
}

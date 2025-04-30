export interface GlobalFilterProps {
    filterText: string;
    onFilterChange: (value: string) => void;
    placeholder?: string;
    selectedColumn: string;
    onColumnChange: (column: string) => void;
    columnOptions: { key: string; label: string }[];
  }

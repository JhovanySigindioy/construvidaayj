export interface TableProps<T extends Record<string, any>> { // Ya habíamos cambiado a 'any'
    headers: (keyof T)[];
    headerLabels?: Partial<Record<keyof T, string>>;
    data: T[];
    // === CORRECCIÓN AQUÍ: Usar un tipo mapeado para mayor precisión ===
    cellRenderers?: {
        [K in keyof T]?: (value: T[K], row: T) => React.ReactNode;
    };
    // =================================================================
    rowActions?: (row: T) => React.ReactNode;
    locale?: string;
}
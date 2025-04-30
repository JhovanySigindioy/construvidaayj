export interface TableProps<T extends Record<string, unknown>> {
    headers: (keyof T)[];
    headerLabels?: Partial<Record<keyof T, string>>;
    data: T[];
    cellRenderers?: Partial<Record<keyof T, (value: T[keyof T], row: T) => React.ReactNode>>;
    rowActions?: (row: T) => React.ReactNode;
    locale?: string;
}
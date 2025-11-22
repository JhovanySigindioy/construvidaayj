// Datos de cada mes en el reporte
export interface MonthlyAffiliationData {
    month: number;               // número del mes (1-12)
    month_name: string;          // nombre corto del mes ("Ene", "Feb", ...)
    new_affiliations: number;    // afiliaciones manuales (nuevas)
    old_affiliations: number;    // afiliaciones auto-renovadas (antiguas)
    total: number;               // suma de nuevas + antiguas
}

// Respuesta completa de la API
export interface ApiResponseReports {
    success: boolean;
    data: MonthlyAffiliationData[] | null;
    error?: string | null; // opcional: error puede no estar siempre
}

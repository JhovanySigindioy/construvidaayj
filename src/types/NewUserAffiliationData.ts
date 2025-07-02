// types/NewUserAffiliationData.ts

// Define los estados posibles para el campo 'paid' para mejorar la seguridad de tipo
export type NewUserPaymentStatus = 'Pagado' | 'Pendiente' | 'En Proceso';

/**
 * Interfaz para los datos detallados de una afiliación de "nuevo usuario"
 * tal como son devueltos por el backend en `newUsersList` y `daily-new-users`.
 */
export interface NewUserAffiliationData {
    affiliationId: number;
    clientId: number;
    fullName: string;
    identification: string;
    companyName: string | null;
    companyId: number | null;
    phones: string[]; // Array de números de teléfono
    value: number;
    eps: string | null;
    arl: string | null;
    risk: string | null;
    ccf: string | null;
    pensionFund: string | null;
    observation: string | null;
    paid: NewUserPaymentStatus | null; // Estado de pago de la afiliación
    datePaidReceived: string | null; // Formato 'YYYY-MM-DD'
    govRegistryCompletedAt: string | null; // Formato 'YYYY-MM-DD'
    paymentMethodName: string | null; // Nombre del método de pago
    // Si el reporte diario incluye la fecha de creación, podrías añadirla aquí:
    createdAt?: string; // Opcional, si el backend lo devuelve para el reporte diario
}

/**
 * Interfaz para la estructura de datos que devuelve el endpoint `getNewUsersCount`
 * para cada período (currentMonth, monthMinus1, etc.).
 * (Esta interfaz es para el reporte de conteo mensual, no para el diario detallado).
 */
export interface NewUsersReportPeriodData {
    month: number;
    year: number;
    newUsersCount: number;
    newUsersList: NewUserAffiliationData[];
}

/**
 * Interfaz para la respuesta completa del endpoint `getNewUsersCount`.
 * (Esta interfaz es para el reporte de conteo mensual, no para el diario detallado).
 */
export interface NewUsersReportResponse {
    success: boolean;
    data: {
        currentMonth: NewUsersReportPeriodData;
        monthMinus1: NewUsersReportPeriodData;
        monthMinus2: NewUsersReportPeriodData;
        monthMinus3: NewUsersReportPeriodData;
    };
}
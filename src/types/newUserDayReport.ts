/**
 * Representa una única afiliación de un nuevo usuario en el reporte.
 */
export interface NewAffiliation {
  affiliationId: number;
  clientId: number;
  fullName: string;
  identification: string;
  phones: string[]; // Un array de cadenas para los números de teléfono
  value: string; // El valor se devuelve como string desde la base de datos (DECIMAL)
  companyName: string | null;
  companyId: number | null;
  eps: string | null;
  arl: string | null;
  risk: string | null;
  ccf: string | null;
  pensionFund: string | null;
  observation: string | null;
  paid: 'Pagado' | 'Pendiente' | 'En Proceso'; // Tipado estricto para los estados de pago
  datePaidReceived: string | null; // Formato 'YYYY-MM-DD HH:MM:SS'
  govRegistryCompletedAt: string | null; // Formato 'YYYY-MM-DD HH:MM:SS'
  paymentMethodName: string | null;
  invoiceUrl: string | null; // URL de la factura, puede ser null
}

/**
 * Representa la estructura de datos del reporte exitoso.
 */
export interface ReportData {
  newUsersList: NewAffiliation[];
}

/**
 * Representa la respuesta completa de una solicitud exitosa.
 */
export interface NewDailyAffiliationsReportSuccessResponse {
  success: true;
  data: ReportData;
}

/**
 * Representa la estructura de una respuesta de error de validación.
 */
export interface ValidationErrorResponse {
  message: string;
  errors: {
    [key: string]: string[]; // Un objeto donde las claves son los nombres de los campos y los valores son arrays de mensajes de error
  };
}

/**
 * Representa la estructura de una respuesta de error general (ej. error interno del servidor).
 */
export interface GeneralErrorResponse {
  success: false;
  message: string;
}

/**
 * Tipo unión para todas las posibles respuestas del endpoint.
 */
export type NewDailyAffiliationsReportResponse =
  | NewDailyAffiliationsReportSuccessResponse
  | ValidationErrorResponse
  | GeneralErrorResponse;
export interface OldAffiliation {
  affiliationId: number;
  clientId: number;
  fullName: string;
  identification: string;
  phones: string[];
  value: number;
  companyName: string;
  companyId: number;
  eps: string;
  arl: string;
  risk: string;
  ccf: string;
  pensionFund: string;
  observation: string;
  paid: 'Pagado' | 'Pendiente' | 'En Proceso';
  datePaidReceived: string;
  govRegistryCompletedAt: string | null;
  paymentMethodName: string;
  facturaId: number | null;
  facturaNumero: string | null;
  facturaInvoiceStatus: string | null;
  invoiceUrl: string | null;
}

export interface DailyOldAffiliationsReportSuccessResponse {
  success: true;
  data: {
    oldUsersList: OldAffiliation[];
  };
}

export interface ValidationErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface GeneralErrorResponse {
  success: false;
  message: string;
}

export type DailyOldAffiliationsReportResponse =
  | DailyOldAffiliationsReportSuccessResponse
  | ValidationErrorResponse
  | GeneralErrorResponse;

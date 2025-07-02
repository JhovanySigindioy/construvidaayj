export type PaymentStatus = "Pagado" | "Pendiente" | "En Proceso";

export interface DataClient {
    clientId: number; // Corresponde a 'c.id AS client_id' en la consulta
    affiliationId: number; // Corresponde a 'ma.id AS affiliation_id' en la consulta
    fullName: string; // Corresponde a 'c.full_name'
    identification: string; // Corresponde a 'c.identification'
    companyName: string; // Corresponde a 'comp.name AS company_name'
    value: number; // Corresponde a 'ma.value' (casteado a float en el backend)
    risk: string; // Corresponde a 'ma.risk'
    observation: string | null; // Corresponde a 'ma.observation' (puede ser nulo)
    paid: PaymentStatus; // Corresponde a 'ps.status_name AS paid'
    datePaidReceived: string | null; // Corresponde a 'ma.date_paid_received' (formato YYYY-MM-DD, puede ser nulo)
    govRegistryCompletedAt: string | null; // Corresponde a 'ma.gov_record_completed_at' (formato YYYY-MM-DD, puede ser nulo)
    eps: string | null; // Corresponde a 'eps.name' (puede ser nulo si no hay EPS)
    arl: string | null; // Corresponde a 'arl.name' (puede ser nulo si no hay ARL)
    ccf: string | null; // Corresponde a 'ccf.name' (puede ser nulo si no hay CCF)
    pensionFund: string | null; // Corresponde a 'pf.name' (puede ser nulo si no hay fondo de pensión)
    
    paymentMethodName: string | null; // Corresponde a 'pm.name AS payment_method_name' (puede ser nulo)
    phones: string[]; // Corresponde a GROUP_CONCAT(cp.phone_number), separado en un array en el backend
    facturaId: number | null; // ADICIÓN: ID de la factura asociada (puede ser nulo)
    facturaNumero: string | null; // ADICIÓN: Número de la factura (puede ser nulo)
    facturaInvoiceStatus: string | null; // ADICIÓN: Estado de la factura (puede ser nulo)
    facturaPdfPath: string | null; // ADICIÓN: Ruta del PDF de la factura (puede ser nulo)
}
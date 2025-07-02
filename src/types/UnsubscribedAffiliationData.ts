// Define los estados posibles para el campo 'paid' para mejorar la seguridad de tipo
export type PaymentStatus = 'Pagado' | 'Pendiente' | 'En Proceso';

export interface UnsubscribedAffiliationData {
    // === Campos de la Afiliación Original ===
    clientId: number;
    affiliationId: number; // ID de la tabla monthly_affiliations
    fullName: string;
    identification: string;
    companyName: string | null; // Nombre de la empresa asociada al cliente
    companyId: number; // ID de la empresa
    phones: string[]; // Array de teléfonos
    datePaidReceived: string | null; // Formato 'YYYY-MM-DD'
    govRegistryCompletedAt: string | null; // Formato 'YYYY-MM-DD'
    value: number;
    eps: string | null; // Nombre de la EPS
    arl: string | null; // Nombre de la ARL
    risk: string | null;
    ccf: string | null; // Nombre de la CCF
    pensionFund: string | null; // Nombre del Fondo de Pensión
    observation: string | null; // Observación de la afiliación original
    paid: PaymentStatus; // Estado de pago de la afiliación original (Ahora usa PaymentStatus)
    paymentMethodName: string | null; // Nombre del método de pago (Añadido para consistencia con CustomerManagementPage)
    talonNumber: string | null; // Hago que sea nullable ya que a veces puede no existir

    // === Campos de Desafiliación / Historial ===
    deletedAt: string | null; // Fecha en que la afiliación fue marcada como inactiva (YYYY-MM-DD)
    deletedByUserName: string | null; // Nombre del usuario que la desactivó

    unsubscriptionRecordId: number | null; // ID del registro en clients_unsubscriptions

    unsubscriptionDate: string | null; // Fecha de la desafiliación del registro clients_unsubscriptions (YYYY-MM-DD)
    unsubscriptionReason: string | null; // Razón de la desafiliación del registro clients_unsubscriptions
    unsubscriptionCost: number | null; // Costo asociado a la desafiliación del registro clients_unsubscriptions
    unsubscriptionObservation: string | null; // Observación específica del registro clients_unsubscriptions

    // === Campos de Factura Asociada (ADICIÓN) ===
    facturaId: number | null; // ID de la factura asociada (si existe)
    facturaNumero: string | null; // Número de la factura (si existe)
    facturaInvoiceStatus: string | null; // Estado de la factura (si existe)
    facturaPdfPath: string | null; // Ruta al PDF de la factura (si existe)
}

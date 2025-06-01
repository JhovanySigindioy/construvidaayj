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
    paid: 'Pagado' | 'Pendiente' | string; // Estado de pago de la afiliación original

    // === Campos de Desafiliación / Historial ===
    deletedAt: string | null; // Fecha en que la afiliación fue marcada como inactiva (YYYY-MM-DD)
    deletedByUserName: string | null; // Nombre del usuario que la desactivó

    // **¡NUEVO CAMPO CRUCIAL!**
    unsubscriptionRecordId: number | null; // ID del registro en clients_unsubscriptions

    unsubscriptionDate: string | null; // Fecha de la desafiliación del registro clients_unsubscriptions (YYYY-MM-DD)
    unsubscriptionReason: string | null; // Razón de la desafiliación del registro clients_unsubscriptions
    unsubscriptionCost: number | null; // Costo asociado a la desafiliación del registro clients_unsubscriptions
    unsubscriptionObservation: string | null; // Observación específica del registro clients_unsubscriptions
}
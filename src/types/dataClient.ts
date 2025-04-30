export type PaymentStatus = 'Pagado' | 'Pendiente';

export type DataClient = {
  clientId: string;
  affiliationId: string;
  fullName: string;
  identification: string;
  value: number;
  eps: string;
  arl: string;
  risk: string;
  ccf: string;
  pensionFund: string;
  paid: PaymentStatus;
  observation: string;
  datePaidReceived: string;
};

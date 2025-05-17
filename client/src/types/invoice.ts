export interface InvoiceData {
  id?: number;
  invoiceNumber: string;
  customerName: string;
  customerContact: string;
  description: string;
  amountPaid: number;
  dueAmount: number;
  totalAmount: number;
  createdAt?: Date;
}

export interface InvoiceInput {
  customerName: string;
  customerContact: string;
  description: string;
  amountPaid: number;
  dueAmount: number;
}

export interface CSVRow {
  'Customer Name': string;
  'Customer Contact Number': string;
  'Payment For': string;
  'Amount Paid': string;
  'Due Amount': string;
}

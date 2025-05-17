export interface InvoiceData {
  id: number;
  invoiceNumber: string;
  customerName: string;
  customerContact: string;
  description: string;
  amountPaid: string;
  dueAmount: string;
  totalAmount: string;
  createdAt: Date;
  isDownloaded?: boolean;
  isActive?: boolean;
}

export interface InvoiceInput {
  customerName: string;
  customerContact: string;
  description: string;
  amountPaid: string;
  dueAmount: string;
}

export interface CSVRow {
  'Customer Name': string;
  'Customer Contact Number': string;
  'Payment For': string;
  'Amount Paid': string;
  'Due Amount': string;
}

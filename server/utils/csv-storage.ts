import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import type { Invoice } from '@shared/schema';

const CSV_FILE_PATH = path.join(process.cwd(), 'invoices.csv');

// Ensure CSV file exists with headers
function ensureCSVFile() {
  if (!fs.existsSync(CSV_FILE_PATH)) {
    const headers = [
      'id',
      'invoiceNumber',
      'customerName',
      'customerContact',
      'description',
      'amountPaid',
      'dueAmount',
      'totalAmount',
      'createdAt',
      'isDownloaded',
      'isActive'
    ];
    fs.writeFileSync(CSV_FILE_PATH, headers.join(',') + '\n');
  }
}

// Get the next invoice ID
export function getNextInvoiceId(): number {
  ensureCSVFile();
  const invoices = getAllInvoices();
  if (invoices.length === 0) return 1;
  return Math.max(...invoices.map(inv => inv.id)) + 1;
}

// Get all invoices
export function getAllInvoices(): Invoice[] {
  ensureCSVFile();
  const content = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
  if (!content.trim()) return [];
  
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    cast: true,
    trim: true,
    quote: '"',
    auto_parse: true
  });

  return records.map((record: any) => ({
    ...record,
    id: parseInt(record.id),
    amountPaid: record.amountPaid.toString(),
    dueAmount: record.dueAmount.toString(),
    totalAmount: record.totalAmount.toString(),
    createdAt: new Date(record.createdAt),
    isDownloaded: record.isDownloaded === 'true' || record.isDownloaded === '"true"' || record.isDownloaded === '1',
    isActive: record.isActive === undefined ? true : (record.isActive === 'true' || record.isActive === '"true"' || record.isActive === '1')
  }));
}

// Get undownloaded invoices
export function getUndownloadedInvoices(): Invoice[] {
  return getAllInvoices().filter(invoice => !invoice.isDownloaded && invoice.isActive);
}

// Save a new invoice
export function saveInvoice(invoice: Invoice): Invoice {
  ensureCSVFile();
  
  // Add to CSV file
  const csvLine = stringify([{
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    customerName: invoice.customerName,
    customerContact: invoice.customerContact,
    description: invoice.description,
    amountPaid: invoice.amountPaid,
    dueAmount: invoice.dueAmount,
    totalAmount: invoice.totalAmount,
    createdAt: invoice.createdAt.toISOString(),
    isDownloaded: invoice.isDownloaded ? 'true' : 'false',
    isActive: invoice.isActive === undefined ? 'true' : (invoice.isActive ? 'true' : 'false')
  }], {
    header: false,
    quoted: true
  });
  
  fs.appendFileSync(CSV_FILE_PATH, csvLine);
  return invoice;
}

// Mark invoice as inactive
export function markInvoiceAsInactive(invoiceId: number): void {
  const invoices = getAllInvoices();
  const updatedInvoices = invoices.map(invoice => {
    if (invoice.id === invoiceId) {
      return { ...invoice, isActive: false };
    }
    return invoice;
  });

  // Rewrite the entire file with updated data
  const csvContent = stringify(
    updatedInvoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      customerContact: invoice.customerContact,
      description: invoice.description,
      amountPaid: invoice.amountPaid,
      dueAmount: invoice.dueAmount,
      totalAmount: invoice.totalAmount,
      createdAt: invoice.createdAt.toISOString(),
      isDownloaded: invoice.isDownloaded ? 'true' : 'false',
      isActive: invoice.isActive ? 'true' : 'false'
    })),
    {
      header: true,
      quoted: true
    }
  );

  fs.writeFileSync(CSV_FILE_PATH, csvContent + '\n');
}

// Mark invoice as downloaded
export function markInvoiceAsDownloaded(invoiceId: number): void {
  const invoices = getAllInvoices();
  const updatedInvoices = invoices.map(invoice => {
    if (invoice.id === invoiceId) {
      return { ...invoice, isDownloaded: true };
    }
    return invoice;
  });

  // Rewrite the entire file with updated data
  const csvContent = stringify(
    updatedInvoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      customerContact: invoice.customerContact,
      description: invoice.description,
      amountPaid: invoice.amountPaid,
      dueAmount: invoice.dueAmount,
      totalAmount: invoice.totalAmount,
      createdAt: invoice.createdAt.toISOString(),
      isDownloaded: invoice.isDownloaded ? 'true' : 'false',
      isActive: invoice.isActive ? 'true' : 'false'
    })),
    {
      header: true,
      quoted: true
    }
  );

  fs.writeFileSync(CSV_FILE_PATH, csvContent + '\n');
}

// Mark multiple invoices as downloaded
export function markInvoicesAsDownloaded(invoiceIds: number[]): void {
  const invoices = getAllInvoices();
  const updatedInvoices = invoices.map(invoice => {
    if (invoiceIds.includes(invoice.id)) {
      return { ...invoice, isDownloaded: true };
    }
    return invoice;
  });

  // Rewrite the entire file with updated data
  const csvContent = stringify(
    updatedInvoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      customerContact: invoice.customerContact,
      description: invoice.description,
      amountPaid: invoice.amountPaid,
      dueAmount: invoice.dueAmount,
      totalAmount: invoice.totalAmount,
      createdAt: invoice.createdAt.toISOString(),
      isDownloaded: invoice.isDownloaded ? 'true' : 'false',
      isActive: invoice.isActive ? 'true' : 'false'
    })),
    {
      header: true,
      quoted: true
    }
  );

  fs.writeFileSync(CSV_FILE_PATH, csvContent + '\n');
}

// Save multiple invoices
export function saveInvoices(invoices: Invoice[]): Invoice[] {
  ensureCSVFile();
  
  const csvLines = stringify(
    invoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      customerContact: invoice.customerContact,
      description: invoice.description,
      amountPaid: invoice.amountPaid,
      dueAmount: invoice.dueAmount,
      totalAmount: invoice.totalAmount,
      createdAt: invoice.createdAt.toISOString(),
      isDownloaded: invoice.isDownloaded ? 'true' : 'false',
      isActive: invoice.isActive ? 'true' : 'false'
    })),
    {
      header: false,
      quoted: true
    }
  );
  
  fs.appendFileSync(CSV_FILE_PATH, csvLines);
  return invoices;
} 
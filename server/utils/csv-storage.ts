import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import type { Invoice } from '@shared/schema';

const CSV_FILE_PATH = path.join(process.cwd(), 'invoices.csv');

// Ensure CSV file exists with headers
function ensureCSVFile() {
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

  // If file doesn't exist or is empty, write headers
  if (!fs.existsSync(CSV_FILE_PATH) || fs.readFileSync(CSV_FILE_PATH, 'utf-8').trim() === '') {
    fs.writeFileSync(CSV_FILE_PATH, headers.join(',') + '\n');
  } else {
    // Check if file has headers
    const firstLine = fs.readFileSync(CSV_FILE_PATH, 'utf-8').split('\n')[0];
    if (!firstLine.includes('id') || !firstLine.includes('invoiceNumber')) {
      fs.writeFileSync(CSV_FILE_PATH, headers.join(',') + '\n');
    }
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
  try {
    ensureCSVFile();
    const content = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // If file is empty or only has headers, return empty array
    if (lines.length <= 1) {
      return [];
    }
    
    try {
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        cast: true,
        trim: true,
        quote: '"',
        auto_parse: true,
        relaxColumnCount: true // Add this to handle potential column count mismatches
      });

      return records.map((record: any) => ({
        ...record,
        id: parseInt(record.id) || 1,
        amountPaid: (record.amountPaid || '0').toString(),
        dueAmount: (record.dueAmount || '0').toString(),
        totalAmount: (record.totalAmount || '0').toString(),
        createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
        isDownloaded: record.isDownloaded === 'true' || record.isDownloaded === '"true"' || record.isDownloaded === '1',
        isActive: record.isActive === undefined ? true : (record.isActive === 'true' || record.isActive === '"true"' || record.isActive === '1')
      }));
    } catch (parseError) {
      // If parsing fails, reinitialize the file with headers
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
      return [];
    }
  } catch (error) {
    // If any file operation fails, ensure the file exists with headers
    ensureCSVFile();
    return [];
  }
}

// Get undownloaded invoices
export function getUndownloadedInvoices(): Invoice[] {
  return getAllInvoices().filter(invoice => !invoice.isDownloaded && invoice.isActive);
}

// Save a new invoice
export function saveInvoice(invoice: Invoice): Invoice {
  try {
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
    
    try {
      // Check if file is empty (only contains headers)
      const content = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length <= 1) {
        // File is empty or only has headers
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
        ].join(',');
        
        fs.writeFileSync(CSV_FILE_PATH, headers + '\n' + csvLine);
      } else {
        // Append to existing content
        fs.appendFileSync(CSV_FILE_PATH, csvLine);
      }
    } catch (writeError) {
      // If writing fails, try to reinitialize the file
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
      ].join(',');
      
      fs.writeFileSync(CSV_FILE_PATH, headers + '\n' + csvLine);
    }
    
    return invoice;
  } catch (error) {
    throw new Error('Failed to save invoice');
  }
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
  
  // Check if file is empty (only contains headers)
  const content = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length <= 1) {
    // File is empty or only has headers, write with headers
    const headers = lines[0] || content.trim();
    fs.writeFileSync(CSV_FILE_PATH, headers + '\n' + csvLines);
  } else {
    // Append to existing content
    fs.appendFileSync(CSV_FILE_PATH, csvLines);
  }
  
  return invoices;
} 
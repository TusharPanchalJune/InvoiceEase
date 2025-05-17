import { InvoiceData } from '@/types/invoice';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { format } from 'date-fns';

export async function generatePDF(invoice: InvoiceData): Promise<void> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a new page
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  
  // Embed fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Set page margins
  const margin = 50;
  const width = page.getWidth() - 2 * margin;
  
  // Set current y position (start from top)
  let y = page.getHeight() - margin;
  
  // Header - Background rectangle for the header
  page.drawRectangle({
    x: margin,
    y: y - 80,
    width: width,
    height: 80,
    color: rgb(0.39, 0.4, 0.94), // Primary color
  });
  
  // Invoice title
  page.drawText('INVOICE', {
    x: margin + 20,
    y: y - 45,
    size: 24,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  
  // Invoice number and date
  const formattedDate = invoice.createdAt
    ? format(new Date(invoice.createdAt), 'MMMM d, yyyy')
    : format(new Date(), 'MMMM d, yyyy');
  
  page.drawText(invoice.invoiceNumber, {
    x: margin + width - 150,
    y: y - 35,
    size: 12,
    font: helveticaFont,
    color: rgb(1, 1, 1),
  });
  
  page.drawText(formattedDate, {
    x: margin + width - 150,
    y: y - 55,
    size: 10,
    font: helveticaFont,
    color: rgb(1, 1, 1),
  });
  
  // Move position down past the header
  y -= 120;
  
  // Company info
  page.drawText('MP Beauty Association', {
    x: margin,
    y,
    size: 16,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  y -= 50;
  
  // Customer Info
  page.drawText('BILLED TO', {
    x: margin,
    y,
    size: 10,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  y -= 20;
  
  page.drawText(invoice.customerName, {
    x: margin,
    y,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  y -= 20;
  
  page.drawText(invoice.customerContact, {
    x: margin,
    y,
    size: 10,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  y -= 40;
  
  // Draw horizontal line
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + width, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  
  y -= 30;
  
  // Description header
  page.drawText('Description', {
    x: margin,
    y,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  // Amount header
  page.drawText('Amount', {
    x: margin + width - 100,
    y,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  y -= 25;
  
  // Service description
  page.drawText(invoice.description, {
    x: margin,
    y,
    size: 11,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Total for the service
  page.drawText(`$${invoice.totalAmount.toFixed(2)}`, {
    x: margin + width - 100,
    y,
    size: 11,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  y -= 30;
  
  // Draw horizontal line
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + width, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  
  y -= 40;
  
  // Amount paid
  page.drawText('Amount Paid:', {
    x: margin + width - 200,
    y,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`$${invoice.amountPaid.toFixed(2)}`, {
    x: margin + width - 100,
    y,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  y -= 20;
  
  // Due amount
  page.drawText('Due Amount:', {
    x: margin + width - 200,
    y,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`$${invoice.dueAmount.toFixed(2)}`, {
    x: margin + width - 100,
    y,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  y -= 25;
  
  // Total amount
  page.drawText('Total Amount:', {
    x: margin + width - 200,
    y,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`$${invoice.totalAmount.toFixed(2)}`, {
    x: margin + width - 100,
    y,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  // Footer
  y = margin + 50;
  
  page.drawText('© MP Beauty Association. All rights reserved.', {
    x: margin + (width / 2) - 100,
    y,
    size: 8,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  
  // Trigger download
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${invoice.invoiceNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

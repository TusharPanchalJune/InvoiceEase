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
  
  // Company info - upper left
  page.drawText('MP Beauty Association', {
    x: margin,
    y,
    size: 14,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  y -= 20;
  
  page.drawText('Phone: (020) 000-0000', {
    x: margin,
    y,
    size: 10,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  // Invoice title - upper right
  page.drawText('INVOICE', {
    x: margin + width - 100,
    y: page.getHeight() - margin,
    size: 24,
    font: helveticaBold,
    color: rgb(0.6, 0.6, 0.6),
  });
  
  // Invoice details box - upper right below title
  y = page.getHeight() - margin - 50;
  
  // Invoice Number Box
  // Label
  page.drawRectangle({
    x: margin + width - 200,
    y: y,
    width: 100,
    height: 20,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  page.drawText('INVOICE #', {
    x: margin + width - 190,
    y: y + 6,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  // Value
  page.drawRectangle({
    x: margin + width - 100,
    y: y,
    width: 100,
    height: 20,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  page.drawText(invoice.invoiceNumber, {
    x: margin + width - 90,
    y: y + 6,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Date Box
  y -= 20;
  
  // Label
  page.drawRectangle({
    x: margin + width - 200,
    y: y,
    width: 100,
    height: 20,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  page.drawText('DATE', {
    x: margin + width - 190,
    y: y + 6,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  // Value
  page.drawRectangle({
    x: margin + width - 100,
    y: y,
    width: 100,
    height: 20,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  const formattedDate = invoice.createdAt
    ? format(new Date(invoice.createdAt), 'MM/dd/yyyy')
    : format(new Date(), 'MM/dd/yyyy');
  
  page.drawText(formattedDate, {
    x: margin + width - 90,
    y: y + 6,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Bill To section
  y = page.getHeight() - margin - 120;
  
  page.drawRectangle({
    x: margin,
    y: y,
    width: 200,
    height: 20,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  page.drawText('BILL TO', {
    x: margin + 10,
    y: y + 6,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  y -= 25;
  
  page.drawText(invoice.customerName, {
    x: margin,
    y,
    size: 11,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  y -= 15;
  
  page.drawText(invoice.customerContact, {
    x: margin,
    y,
    size: 10,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  // Description table
  y -= 50;
  
  // Table headers
  const tableTop = y;
  const descWidth = width - 100;
  
  // Description header
  page.drawRectangle({
    x: margin,
    y,
    width: descWidth,
    height: 20,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  page.drawText('DESCRIPTION', {
    x: margin + 10,
    y: y + 6,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  // Amount header
  page.drawRectangle({
    x: margin + descWidth,
    y,
    width: 100,
    height: 20,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  page.drawText('AMOUNT', {
    x: margin + descWidth + 10,
    y: y + 6,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  // Table row
  y -= 30;
  
  // Description cell
  page.drawRectangle({
    x: margin,
    y,
    width: descWidth,
    height: 30,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  page.drawText(invoice.description, {
    x: margin + 10,
    y: y + 10,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Amount cell
  page.drawRectangle({
    x: margin + descWidth,
    y,
    width: 100,
    height: 30,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  page.drawText(`₹${invoice.totalAmount.toFixed(2)}`, {
    x: margin + descWidth + 60,
    y: y + 10,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Empty row for space
  y -= 60;
  
  // Description cell
  page.drawRectangle({
    x: margin,
    y,
    width: descWidth,
    height: 60,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  // Amount cell
  page.drawRectangle({
    x: margin + descWidth,
    y,
    width: 100,
    height: 60,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  // Amount paid row
  y -= 20;
  
  // Label cell
  page.drawRectangle({
    x: margin,
    y,
    width: descWidth,
    height: 20,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  page.drawText('Amount Paid:', {
    x: margin + descWidth - 100,
    y: y + 6,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Amount cell
  page.drawRectangle({
    x: margin + descWidth,
    y,
    width: 100,
    height: 20,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  page.drawText(`₹${invoice.amountPaid.toFixed(2)}`, {
    x: margin + descWidth + 60,
    y: y + 6,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Due amount row
  y -= 20;
  
  // Label cell
  page.drawRectangle({
    x: margin,
    y,
    width: descWidth,
    height: 20,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  page.drawText('Due Amount:', {
    x: margin + descWidth - 100,
    y: y + 6,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Amount cell
  page.drawRectangle({
    x: margin + descWidth,
    y,
    width: 100,
    height: 20,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  page.drawText(`₹${invoice.dueAmount.toFixed(2)}`, {
    x: margin + descWidth + 60,
    y: y + 6,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Total row
  y -= 20;
  
  // Label cell
  page.drawRectangle({
    x: margin,
    y,
    width: descWidth,
    height: 20,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  page.drawText('TOTAL', {
    x: margin + descWidth - 100,
    y: y + 6,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  // Amount cell
  page.drawRectangle({
    x: margin + descWidth,
    y,
    width: 100,
    height: 20,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  page.drawText(`₹${invoice.totalAmount.toFixed(2)}`, {
    x: margin + descWidth + 60,
    y: y + 6,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  // Thank you note
  y -= 40;
  
  page.drawText('Thank you for your business!', {
    x: margin + (width / 2) - 60,
    y,
    size: 10,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  // Footer
  y = margin + 20;
  
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

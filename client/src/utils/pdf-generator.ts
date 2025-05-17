import { InvoiceData } from '@/types/invoice';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { format } from 'date-fns';

// Generate PDF bytes and return them (for ZIP creation)
export async function generatePDFBytes(invoice: InvoiceData): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a new page
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  
  // Embed fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  
  // Set page margins
  const margin = 50;
  const width = page.getWidth() - 2 * margin;
  
  // Set current y position (start from top)
  let y = page.getHeight() - margin;
  
  // Company info
  page.drawText('MP Beauty Association', {
    x: margin,
    y,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  y -= 15;
  
  // page.drawText('[Street Address]', {
  //   x: margin,
  //   y,
  //   size: 10,
  //   font: helveticaFont,
  //   color: rgb(0.4, 0.4, 0.4),
  // });
  
  // y -= 15;
  
  // page.drawText('[City, ST ZIP]', {
  //   x: margin,
  //   y,
  //   size: 10,
  //   font: helveticaFont,
  //   color: rgb(0.4, 0.4, 0.4),
  // });
  
  // y -= 15;
  
  // page.drawText('Phone: (000) 000-0000', {
  //   x: margin,
  //   y,
  //   size: 10,
  //   font: helveticaFont,
  //   color: rgb(0.4, 0.4, 0.4),
  // });
  
  // Invoice title
  page.drawText('INVOICE', {
    x: margin + width - 130,
    y: page.getHeight() - margin,
    size: 28,
    font: helveticaBold,
    color: rgb(0.6, 0.6, 0.6),
  });
  
  // Format date in MM/DD/YYYY format
  const formattedDate = invoice.createdAt
    ? format(new Date(invoice.createdAt), 'MM/dd/yyyy')
    : format(new Date(), 'MM/dd/yyyy');
  
  y = page.getHeight() - margin - 70;
  
  // Invoice Number and Date Table
  const tableX = margin + width/2;
  const tableWidth = width/2;
  const tableRowHeight = 25;
  
  // Table Headers - Invoice # and Date
  page.drawRectangle({
    x: tableX,
    y: y - tableRowHeight,
    width: tableWidth/2,
    height: tableRowHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
    color: rgb(0.95, 0.95, 0.95),
  });
  
  page.drawRectangle({
    x: tableX + tableWidth/2,
    y: y - tableRowHeight,
    width: tableWidth/2,
    height: tableRowHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
    color: rgb(0.95, 0.95, 0.95),
  });
  
  page.drawText('INVOICE #', {
    x: tableX + tableWidth/4 - 25,
    y: y - tableRowHeight/2 - 5,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('DATE', {
    x: tableX + tableWidth*3/4 - 15,
    y: y - tableRowHeight/2 - 5,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  // Table Data - Invoice # and Date values
  page.drawRectangle({
    x: tableX,
    y: y - tableRowHeight*2,
    width: tableWidth/2,
    height: tableRowHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
  });
  
  page.drawRectangle({
    x: tableX + tableWidth/2,
    y: y - tableRowHeight*2,
    width: tableWidth/2,
    height: tableRowHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
  });
  
  page.drawText(invoice.invoiceNumber, {
    x: tableX + tableWidth/4 - 20,
    y: y - tableRowHeight - tableRowHeight/2 - 5,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(formattedDate, {
    x: tableX + tableWidth*3/4 - 25,
    y: y - tableRowHeight - tableRowHeight/2 - 5,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  y -= tableRowHeight*2 + 30;
  
  // Bill To Box
  const billToBoxHeight = 25;
  
  // Bill To Header
  page.drawRectangle({
    x: margin,
    y: y - billToBoxHeight,
    width: 200,
    height: billToBoxHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
    color: rgb(0.95, 0.95, 0.95),
  });
  
  page.drawText('BILL TO', {
    x: margin + 10,
    y: y - billToBoxHeight/2 - 5,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  y -= billToBoxHeight + 20;
  
  // Customer Info
  page.drawText(String(invoice.customerName), {
    x: margin,
    y,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  y -= 15;
  
  // page.drawText('[Company Name]', {
  //   x: margin,
  //   y,
  //   size: 10,
  //   font: helveticaFont,
  //   color: rgb(0.4, 0.4, 0.4),
  // });
  
  // y -= 15;
  
  // page.drawText('[Street Address]', {
  //   x: margin,
  //   y,
  //   size: 10,
  //   font: helveticaFont,
  //   color: rgb(0.4, 0.4, 0.4),
  // });
  
  // y -= 15;
  
  // page.drawText('[City, ST ZIP]', {
  //   x: margin,
  //   y,
  //   size: 10,
  //   font: helveticaFont,
  //   color: rgb(0.4, 0.4, 0.4),
  // });
  
  // y -= 15;
  
  page.drawText(String(invoice.customerContact), {
    x: margin,
    y,
    size: 10,
    font: helveticaFont,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  y -= 15;
  
  // page.drawText('[Email Address]', {
  //   x: margin,
  //   y,
  //   size: 10,
  //   font: helveticaFont,
  //   color: rgb(0.4, 0.4, 0.4),
  // });
  
  // y -= 30;
  
  // Description and Amount Table
  const descTableX = margin;
  const descTableWidth = width;
  const descColWidth = width * 0.75;
  const amountColWidth = width * 0.25;
  const descTableRowHeight = 30;
  
  // Table Headers - Description and Amount
  page.drawRectangle({
    x: descTableX,
    y: y - descTableRowHeight,
    width: descColWidth,
    height: descTableRowHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
    color: rgb(0.95, 0.95, 0.95),
  });
  
  page.drawRectangle({
    x: descTableX + descColWidth,
    y: y - descTableRowHeight,
    width: amountColWidth,
    height: descTableRowHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
    color: rgb(0.95, 0.95, 0.95),
  });
  
  page.drawText('DESCRIPTION', {
    x: descTableX + 10,
    y: y - descTableRowHeight/2 - 5,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('AMOUNT', {
    x: descTableX + descColWidth + amountColWidth - 60,
    y: y - descTableRowHeight/2 - 5,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  // First row - Service Description
  page.drawRectangle({
    x: descTableX,
    y: y - descTableRowHeight*2,
    width: descColWidth,
    height: descTableRowHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
  });
  
  page.drawRectangle({
    x: descTableX + descColWidth,
    y: y - descTableRowHeight*2,
    width: amountColWidth,
    height: descTableRowHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
  });
  
  page.drawText(invoice.description, {
    x: descTableX + 10,
    y: y - descTableRowHeight - descTableRowHeight/2 - 5,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`Rs. ${Number(invoice.totalAmount).toFixed(2)}`, {
    x: descTableX + descColWidth + amountColWidth - 70,
    y: y - descTableRowHeight - descTableRowHeight/2 - 5,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Add Amount Paid row
  const paidRowY = y - descTableRowHeight*3;
  page.drawRectangle({
    x: descTableX,
    y: paidRowY - descTableRowHeight,
    width: descColWidth,
    height: descTableRowHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
  });
  
  page.drawRectangle({
    x: descTableX + descColWidth,
    y: paidRowY - descTableRowHeight,
    width: amountColWidth,
    height: descTableRowHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
  });

  page.drawText('Amount Paid', {
    x: descTableX + 10,
    y: paidRowY - descTableRowHeight/2 - 5,
    size: 10,
    font: helveticaFont,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(`Rs. ${Number(invoice.amountPaid).toFixed(2)}`, {
    x: descTableX + descColWidth + amountColWidth - 70,
    y: paidRowY - descTableRowHeight/2 - 5,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0.5, 0),
  });

  // Add Due Amount row
  const dueRowY = y - descTableRowHeight*4;
  page.drawRectangle({
    x: descTableX,
    y: dueRowY - descTableRowHeight,
    width: descColWidth,
    height: descTableRowHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
  });
  
  page.drawRectangle({
    x: descTableX + descColWidth,
    y: dueRowY - descTableRowHeight,
    width: amountColWidth,
    height: descTableRowHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
  });

  page.drawText('Due Amount', {
    x: descTableX + 10,
    y: dueRowY - descTableRowHeight/2 - 5,
    size: 10,
    font: helveticaFont,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(`Rs. ${Number(invoice.dueAmount).toFixed(2)}`, {
    x: descTableX + descColWidth + amountColWidth - 70,
    y: dueRowY - descTableRowHeight/2 - 5,
    size: 10,
    font: helveticaFont,
    color: rgb(0.8, 0, 0),
  });

  // Add one empty row
  const emptyRowY = y - descTableRowHeight*5;
  page.drawRectangle({
    x: descTableX,
    y: emptyRowY - descTableRowHeight,
    width: descColWidth,
    height: descTableRowHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
  });
  
  page.drawRectangle({
    x: descTableX + descColWidth,
    y: emptyRowY - descTableRowHeight,
    width: amountColWidth,
    height: descTableRowHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
  });

  // Final row with thank you and total
  const finalRowY = y - descTableRowHeight*6;
  
  page.drawRectangle({
    x: descTableX,
    y: finalRowY - descTableRowHeight,
    width: descColWidth,
    height: descTableRowHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
  });
  
  page.drawRectangle({
    x: descTableX + descColWidth,
    y: finalRowY - descTableRowHeight,
    width: amountColWidth,
    height: descTableRowHeight,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
  });
  
  page.drawText('Thank you for your business!', {
    x: descTableX + descColWidth/2 - 70,
    y: finalRowY - descTableRowHeight/2 - 5,
    size: 10,
    font: timesRomanItalic,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('TOTAL', {
    x: descTableX + descColWidth + 10,
    y: finalRowY - descTableRowHeight/2 - 5,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`Rs. ${Number(invoice.totalAmount).toFixed(2)}`, {
    x: descTableX + descColWidth + amountColWidth - 70,
    y: finalRowY - descTableRowHeight/2 - 5,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  // Footer text
  y = margin + 70;
  
  // page.drawText('If you have any questions about this invoice, please contact', {
  //   x: margin + width/2 - 150,
  //   y,
  //   size: 9,
  //   font: helveticaFont,
  //   color: rgb(0.4, 0.4, 0.4),
  // });
  
  // y -= 15;
  
  // page.drawText('[Name, Phone, email@address.com]', {
  //   x: margin + width/2 - 90,
  //   y,
  //   size: 9,
  //   font: helveticaFont,
  //   color: rgb(0.4, 0.4, 0.4),
  // });
  
  // Small credit at the bottom
  y = margin;
  
  page.drawText('Invoice Generator © Kashish Panchal', {
    x: margin,
    y,
    size: 8,
    font: helveticaFont,
    color: rgb(0.6, 0.6, 0.6),
  });
  
  // Serialize the PDF to bytes
  return await pdfDoc.save();
}

// Generate PDF and trigger download
export async function generatePDF(invoice: InvoiceData, fileName?: string): Promise<void> {
  try {
    // Generate PDF bytes
    const pdfBytes = await generatePDFBytes(invoice);
    
    // Trigger download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `${invoice.invoiceNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

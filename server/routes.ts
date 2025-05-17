import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { z } from "zod";
import { invoiceSchema } from "@shared/schema";
import multer from "multer";
import { parse } from "csv-parse/sync";

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // Get all invoices
  apiRouter.get("/invoices", async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Create a new invoice
  apiRouter.post("/invoices", async (req, res) => {
    try {
      const validatedData = invoiceSchema.parse(req.body);
      
      // Calculate total amount
      const totalAmount = Number(validatedData.amountPaid) + Number(validatedData.dueAmount);
      
      // Generate invoice number (INV-XXX format)
      const invoiceCount = await storage.getInvoiceCount();
      const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(3, '0')}`;
      
      const newInvoice = await storage.createInvoice({
        ...validatedData,
        invoiceNumber,
        totalAmount
      });
      
      res.status(201).json(newInvoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // Process CSV and create multiple invoices
  apiRouter.post("/invoices/csv", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }

      // Parse CSV file
      const csvData = req.file.buffer.toString('utf8');
      const records = parse(csvData, {
        columns: true,
        skip_empty_lines: true
      });

      if (records.length === 0) {
        return res.status(400).json({ message: "CSV file is empty" });
      }

      // Validate and process each record
      const invoices = [];
      const errors = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        try {
          // Map CSV columns to invoice schema
          const invoiceData = {
            customerName: record['Customer Name'],
            customerContact: record['Customer Contact Number'],
            description: record['Payment For'],
            amountPaid: parseFloat(record['Amount Paid']),
            dueAmount: parseFloat(record['Due Amount'])
          };

          // Validate data
          const validatedData = invoiceSchema.parse(invoiceData);
          
          // Calculate total amount
          const totalAmount = Number(validatedData.amountPaid) + Number(validatedData.dueAmount);
          
          // Generate invoice number
          const invoiceCount = await storage.getInvoiceCount() + i; // Add index to avoid duplicate numbers
          const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(3, '0')}`;
          
          const newInvoice = await storage.createInvoice({
            ...validatedData,
            invoiceNumber,
            totalAmount
          });
          
          invoices.push(newInvoice);
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push({ row: i + 1, errors: error.errors });
          } else {
            errors.push({ row: i + 1, message: "Unknown error processing row" });
          }
        }
      }

      if (invoices.length === 0 && errors.length > 0) {
        return res.status(400).json({ 
          message: "Failed to process CSV file", 
          errors 
        });
      }

      res.status(201).json({ 
        message: `Successfully created ${invoices.length} invoices`,
        invoices,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process CSV file" });
    }
  });

  // Register API routes
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}

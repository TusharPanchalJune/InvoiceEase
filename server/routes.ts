import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { z } from "zod";
import { createInvoiceSchema } from "@shared/schema";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { getNextInvoiceId } from "./utils/csv-storage";

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Define interface for multer request
interface MulterRequest extends Request {
  file?: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // Get all invoices
  apiRouter.get("/invoices", async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices.filter(invoice => invoice.isActive));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Get undownloaded invoices
  apiRouter.get("/invoices/undownloaded", async (req, res) => {
    try {
      const invoices = await storage.getUndownloadedInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch undownloaded invoices" });
    }
  });

  // Mark invoice as inactive (delete)
  apiRouter.delete("/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markInvoiceAsInactive(parseInt(id));
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Mark invoice as downloaded
  apiRouter.post("/invoices/:id/downloaded", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markInvoiceAsDownloaded(parseInt(id));
      res.json({ message: "Invoice marked as downloaded" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark invoice as downloaded" });
    }
  });

  // Mark multiple invoices as downloaded
  apiRouter.post("/invoices/downloaded", async (req, res) => {
    try {
      const { invoiceIds } = req.body;
      if (!Array.isArray(invoiceIds)) {
        return res.status(400).json({ message: "Invalid invoice IDs" });
      }
      await storage.markMultipleAsDownloaded(invoiceIds);
      res.json({ message: "Invoices marked as downloaded" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark invoices as downloaded" });
    }
  });

  // Create a new invoice
  apiRouter.post("/invoices", async (req, res) => {
    try {
      // Parse and validate amounts first
      const amountPaid = Number(req.body.amountPaid);
      const dueAmount = Number(req.body.dueAmount);

      if (isNaN(amountPaid) || amountPaid < 0) {
        return res.status(400).json({ message: "Invalid Amount Paid value" });
      }
      if (isNaN(dueAmount) || dueAmount < 0) {
        return res.status(400).json({ message: "Invalid Due Amount value" });
      }

      // Format amounts with 2 decimal places
      const formattedData = {
        ...req.body,
        amountPaid: amountPaid.toFixed(2),
        dueAmount: dueAmount.toFixed(2)
      };

      const validatedData = createInvoiceSchema.parse(formattedData);
      
      // Calculate total amount
      const totalAmount = (Number(validatedData.amountPaid) + Number(validatedData.dueAmount)).toFixed(2);
      
      // Generate invoice number (INV-XXX format)
      const nextId = getNextInvoiceId();
      const invoiceNumber = `INV-${String(nextId).padStart(3, '0')}`;
      
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
  apiRouter.post("/invoices/csv", upload.single('file'), async (req: MulterRequest, res) => {
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
      let nextId = getNextInvoiceId();

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        try {
          // Parse and validate amounts
          const amountPaid = parseFloat(record['Amount Paid']);
          const dueAmount = parseFloat(record['Due Amount']);

          if (isNaN(amountPaid) || amountPaid < 0) {
            throw new Error('Invalid Amount Paid value');
          }
          if (isNaN(dueAmount) || dueAmount < 0) {
            throw new Error('Invalid Due Amount value');
          }

          // Map CSV columns to invoice schema
          const invoiceData = {
            customerName: record['Customer Name'],
            customerContact: record['Customer Contact Number'],
            description: record['Payment For'],
            amountPaid: amountPaid.toFixed(2),
            dueAmount: dueAmount.toFixed(2)
          };

          // Validate data
          const validatedData = createInvoiceSchema.parse(invoiceData);
          
          // Calculate total amount
          const totalAmount = (Number(validatedData.amountPaid) + Number(validatedData.dueAmount)).toFixed(2);
          
          // Generate invoice number
          const invoiceNumber = `INV-${String(nextId + i).padStart(3, '0')}`;
          
          const newInvoice = await storage.createInvoice({
            customerName: validatedData.customerName,
            customerContact: validatedData.customerContact,
            description: validatedData.description,
            amountPaid: validatedData.amountPaid,
            dueAmount: validatedData.dueAmount,
            invoiceNumber,
            totalAmount
          });
          
          invoices.push(newInvoice);
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push({ row: i + 1, errors: error.errors });
          } else {
            errors.push({ row: i + 1, message: error instanceof Error ? error.message : "Unknown error processing row" });
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

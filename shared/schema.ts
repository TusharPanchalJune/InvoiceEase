import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(),
});

export const insertUserSchema = userSchema.omit({ id: true });

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Invoice schema
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerContact: text("customer_contact").notNull(),
  description: text("description").notNull(),
  amountPaid: numeric("amount_paid").notNull(),
  dueAmount: numeric("due_amount").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  totalAmount: true,
  createdAt: true,
});

// Schema for creating a new invoice
export const createInvoiceSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerContact: z.string().min(1, "Customer contact is required"),
  description: z.string().min(1, "Payment description is required"),
  amountPaid: z.string()
    .min(1, "Amount paid is required")
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, "Amount paid must be a valid number greater than or equal to 0"),
  dueAmount: z.string()
    .min(1, "Due amount is required")
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, "Due amount must be a valid number greater than or equal to 0"),
  invoiceNumber: z.string().optional()
});

// Full invoice schema including all fields
export const invoiceSchema = createInvoiceSchema.extend({
  id: z.number(),
  invoiceNumber: z.string(),
  totalAmount: z.string(),
  createdAt: z.date(),
  isDownloaded: z.boolean(),
  isActive: z.boolean().default(true)
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;

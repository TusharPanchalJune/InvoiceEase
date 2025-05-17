import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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

export const invoiceSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerContact: z.string().min(1, "Customer contact is required"),
  description: z.string().min(1, "Payment description is required"),
  amountPaid: z.coerce.number().min(0, "Amount paid must be 0 or greater"),
  dueAmount: z.coerce.number().min(0, "Due amount must be 0 or greater"),
  invoiceNumber: z.string().optional()
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

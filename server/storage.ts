import { users, invoices, type User, type InsertUser, type Invoice } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count } from "drizzle-orm";

// Extend the storage interface with invoice-related methods
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Invoice methods
  getAllInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined>;
  createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice>;
  getInvoiceCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Invoice methods
  async getAllInvoices(): Promise<Invoice[]> {
    // Sort by creation date, newest first
    return db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber));
    return invoice || undefined;
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> {
    // The createdAt field has a defaultNow() so we don't need to specify it
    const [newInvoice] = await db
      .insert(invoices)
      .values(invoice)
      .returning();
    
    return newInvoice;
  }

  async getInvoiceCount(): Promise<number> {
    const [result] = await db.select({ value: count() }).from(invoices);
    return result?.value || 0;
  }
}

export const storage = new DatabaseStorage();

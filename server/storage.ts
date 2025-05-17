import { users, type User, type InsertUser, type Invoice } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private invoices: Map<number, Invoice>;
  private userCurrentId: number;
  private invoiceCurrentId: number;

  constructor() {
    this.users = new Map();
    this.invoices = new Map();
    this.userCurrentId = 1;
    this.invoiceCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Invoice methods
  async getAllInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).sort((a, b) => {
      // Sort by creation date, newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    return Array.from(this.invoices.values()).find(
      (invoice) => invoice.invoiceNumber === invoiceNumber,
    );
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> {
    const id = this.invoiceCurrentId++;
    const createdAt = new Date();
    
    const newInvoice: Invoice = {
      ...invoice,
      id,
      createdAt
    };
    
    this.invoices.set(id, newInvoice);
    return newInvoice;
  }

  async getInvoiceCount(): Promise<number> {
    return this.invoiceCurrentId - 1;
  }
}

export const storage = new MemStorage();

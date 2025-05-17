import { type User, type InsertUser, type Invoice } from "@shared/schema";
import { getAllInvoices, saveInvoice, saveInvoices, getNextInvoiceId, getUndownloadedInvoices, markInvoiceAsDownloaded, markInvoicesAsDownloaded, markInvoiceAsInactive } from "./utils/csv-storage";

// Extend the storage interface with invoice-related methods
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Invoice methods
  getAllInvoices(): Promise<Invoice[]>;
  getUndownloadedInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined>;
  createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'isDownloaded' | 'isActive'>): Promise<Invoice>;
  markInvoiceAsDownloaded(id: number): Promise<void>;
  markMultipleAsDownloaded(invoiceIds: number[]): Promise<void>;
  markInvoiceAsInactive(id: number): Promise<void>;
  getInvoiceCount(): Promise<number>;
}

export class FileStorage implements IStorage {
  private users: Map<number, User>;
  private userCurrentId: number;

  constructor() {
    this.users = new Map();
    this.userCurrentId = 1;
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
    return getAllInvoices().sort((a, b) => {
      // Sort by creation date, newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getUndownloadedInvoices(): Promise<Invoice[]> {
    return getUndownloadedInvoices().sort((a, b) => {
      // Sort by creation date, newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const invoices = getAllInvoices();
    return invoices.find(invoice => invoice.id === id);
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    const invoices = getAllInvoices();
    return invoices.find(invoice => invoice.invoiceNumber === invoiceNumber);
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'isDownloaded' | 'isActive'>): Promise<Invoice> {
    const id = getNextInvoiceId();
    const createdAt = new Date();
    
    const newInvoice: Invoice = {
      ...invoice,
      id,
      createdAt,
      isDownloaded: false,
      isActive: true
    };
    
    return saveInvoice(newInvoice);
  }

  async markInvoiceAsDownloaded(id: number): Promise<void> {
    await markInvoiceAsDownloaded(id);
  }

  async markMultipleAsDownloaded(invoiceIds: number[]): Promise<void> {
    await markInvoicesAsDownloaded(invoiceIds);
  }

  async markInvoiceAsInactive(id: number): Promise<void> {
    await markInvoiceAsInactive(id);
  }

  async getInvoiceCount(): Promise<number> {
    return getAllInvoices().length;
  }
}

export const storage = new FileStorage();

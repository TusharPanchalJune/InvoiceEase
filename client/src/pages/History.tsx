import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Link } from "wouter";
import { useInvoices } from "@/hooks/useInvoices";

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCriteria, setFilterCriteria] = useState<"customerName" | "invoiceNumber" | "date">("customerName");
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceData[]>([]);
  
  // Use the same invoices hook from Home page
  const { invoices, isLoading, downloadPdf } = useInvoices();
  
  // Apply filters when invoices or filter criteria change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInvoices(invoices);
      return;
    }
    
    const filtered = invoices.filter(invoice => {
      const searchLower = searchTerm.toLowerCase();
      
      switch (filterCriteria) {
        case "customerName":
          return invoice.customerName.toLowerCase().includes(searchLower);
        case "invoiceNumber":
          return invoice.invoiceNumber.toLowerCase().includes(searchLower);
        case "date":
          if (invoice.createdAt) {
            const dateStr = format(new Date(invoice.createdAt), "MM/dd/yyyy");
            return dateStr.includes(searchTerm);
          }
          return false;
        default:
          return true;
      }
    });
    
    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, filterCriteria]);
  
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">MP Beauty Association</h1>
            </div>
            <h2 className="text-lg font-medium text-gray-600">Invoice History</h2>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6 flex justify-between items-center">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <i className="ri-arrow-left-line"></i> Back to Generator
            </Button>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Invoice History</h2>
        </div>
        
        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-criteria">Filter By</Label>
              <Select 
                value={filterCriteria} 
                onValueChange={(value) => setFilterCriteria(value as any)}
              >
                <SelectTrigger id="filter-criteria" className="w-full">
                  <SelectValue placeholder="Select filter criteria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customerName">Customer Name</SelectItem>
                  <SelectItem value="invoiceNumber">Invoice Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="search-term">Search</Label>
              <Input
                id="search-term"
                placeholder={`Search by ${filterCriteria === 'customerName' ? 'customer name' : filterCriteria === 'invoiceNumber' ? 'invoice number' : 'date'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-8 text-center">
              <div className="rounded-full bg-gray-100 p-4 mb-4 mx-auto w-16 h-16 flex items-center justify-center">
                <i className="ri-file-list-3-line text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No invoices found</h3>
              <p className="text-gray-500">
                {searchTerm ? "Try adjusting your search or filter criteria" : "Generate some invoices to see them here"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={`${invoice.invoiceNumber}-${invoice.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.createdAt 
                          ? format(new Date(invoice.createdAt), "MM/dd/yyyy") 
                          : format(new Date(), "MM/dd/yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rs. {invoice.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          size="sm" 
                          onClick={() => downloadPdf(invoice)}
                          className="flex items-center"
                        >
                          <i className="ri-download-line mr-1"></i> Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} MP Beauty Association. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
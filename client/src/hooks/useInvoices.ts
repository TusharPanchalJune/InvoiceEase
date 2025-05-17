import { useState, useEffect } from "react";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { InvoiceData, InvoiceInput } from "@/types/invoice";
import { apiRequest } from "@/lib/queryClient";
import { generatePDF } from "@/utils/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { parseCSV } from "@/utils/csv-parser";

const queryClient = new QueryClient();

export function useInvoices() {
  const { toast } = useToast();
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Fetch all invoices
  const { 
    data: invoices = [], 
    isLoading,
    isError,
    refetch
  } = useQuery<InvoiceData[]>({
    queryKey: ["/api/invoices"],
    refetchOnWindowFocus: false,
  });

  // Handle any fetch errors
  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: "Failed to load invoices. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, toast]);

  // Create a new invoice (manual form)
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: InvoiceInput) => {
      const response = await apiRequest("POST", "/api/invoices", invoiceData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice generated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  // Process CSV file
  const processCSVMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/invoices/csv", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process CSV file");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `${data.invoices.length} invoices generated successfully`,
      });
      
      if (data.errors && data.errors.length > 0) {
        toast({
          title: "Warning",
          description: `${data.errors.length} rows had errors and were skipped`,
          variant: "destructive",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process CSV file",
        variant: "destructive",
      });
    },
  });

  // Process CSV file
  const processCSV = async (file: File) => {
    try {
      // Parse CSV client-side first to validate format
      await parseCSV(file);
      await processCSVMutation.mutateAsync(file);
    } catch (error: any) {
      toast({
        title: "CSV Parsing Error",
        description: error.message || "Invalid CSV format",
        variant: "destructive",
      });
    }
  };

  // Create an invoice manually
  const createInvoice = async (data: InvoiceInput) => {
    await createInvoiceMutation.mutateAsync(data);
  };

  // Download single invoice as PDF
  const downloadPdf = async (invoice: InvoiceData) => {
    try {
      setDownloadingIds(prev => new Set(prev).add(invoice.invoiceNumber));
      await generatePDF(invoice);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF for download",
        variant: "destructive",
      });
    } finally {
      setDownloadingIds(prev => {
        const updated = new Set(prev);
        updated.delete(invoice.invoiceNumber);
        return updated;
      });
    }
  };

  // Download all invoices as PDFs
  const downloadAllPdfs = async () => {
    if (invoices.length === 0) return;
    
    try {
      setIsDownloadingAll(true);
      // Download each invoice with a small delay to prevent browser from blocking
      for (const invoice of invoices) {
        await generatePDF(invoice);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast({
        title: "Success",
        description: `Downloaded ${invoices.length} invoices`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download all invoices",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return {
    invoices,
    isLoading: isLoading || createInvoiceMutation.isPending || processCSVMutation.isPending,
    isProcessingCSV: processCSVMutation.isPending,
    isCreatingInvoice: createInvoiceMutation.isPending,
    isDownloadingInvoice: (invoiceNumber: string) => downloadingIds.has(invoiceNumber),
    isDownloadingAll,
    createInvoice,
    processCSV,
    downloadPdf,
    downloadAllPdfs,
  };
}

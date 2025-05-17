import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InvoiceData, InvoiceInput } from "@/types/invoice";
import { apiRequest } from "@/lib/queryClient";
import { generatePDF, generatePDFBytes } from "@/utils/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { parseCSV } from "@/utils/csv-parser";
import JSZip from "jszip";
import { format } from "date-fns";

export function useInvoices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Fetch all invoices
  const { 
    data: allInvoices = [], 
    isLoading,
    isError,
    refetch
  } = useQuery<InvoiceData[]>({
    queryKey: ['/api/invoices'],
    refetchOnWindowFocus: false,
    gcTime: 0,
    staleTime: 0
  });

  // Fetch undownloaded invoices
  const { 
    data: undownloadedInvoices = [],
    refetch: refetchUndownloaded
  } = useQuery<InvoiceData[]>({
    queryKey: ['/api/invoices/undownloaded'],
    refetchOnWindowFocus: false,
    gcTime: 0,
    staleTime: 0
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

  // Mark invoice as downloaded
  const markAsDownloadedMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await apiRequest("POST", `/api/invoices/${invoiceId}/downloaded`);
      return response.json();
    },
    onSuccess: async () => {
      // Invalidate and immediately refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/invoices/undownloaded'] })
      ]);
      await Promise.all([refetch(), refetchUndownloaded()]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to mark invoice as downloaded",
        variant: "destructive",
      });
    },
  });

  // Create a new invoice (manual form)
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: InvoiceInput) => {
      const response = await apiRequest("POST", "/api/invoices", invoiceData);
      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Invoice generated successfully",
      });
      // Invalidate and immediately refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/invoices/undownloaded'] })
      ]);
      await Promise.all([refetch(), refetchUndownloaded()]);
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
    onSuccess: async (data) => {
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
      
      // Invalidate and immediately refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/invoices/undownloaded'] })
      ]);
      await Promise.all([refetch(), refetchUndownloaded()]);
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

  // Generate a file name for an invoice based on customer name, date, and amount
  const getInvoiceFileName = (invoice: InvoiceData): string => {
    const customerNameSlug = invoice.customerName.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');
    const dateStr = invoice.createdAt 
      ? format(new Date(invoice.createdAt), "yyyyMMdd")
      : format(new Date(), "yyyyMMdd");
    const amount = Number(invoice.totalAmount).toFixed(0);
    return `${customerNameSlug}_${dateStr}_${amount}_${invoice.invoiceNumber}.pdf`;
  };

  // Download single invoice as PDF
  const downloadPdf = async (invoice: InvoiceData) => {
    try {
      setDownloadingIds(prev => new Set(prev).add(invoice.invoiceNumber));
      const fileName = getInvoiceFileName(invoice);
      await generatePDF(invoice, fileName);
      await markAsDownloadedMutation.mutateAsync(invoice.id);
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

  // Download all invoices as a ZIP file containing PDFs
  const downloadAllPdfs = async () => {
    if (undownloadedInvoices.length === 0) return;
    
    try {
      setIsDownloadingAll(true);
      const zip = new JSZip();
      
      // Show progress toast
      toast({
        title: "Generating PDFs",
        description: "Creating PDF files...",
      });
      
      // Generate PDF bytes for each invoice and add to zip
      for (const invoice of undownloadedInvoices) {
        try {
          const fileName = getInvoiceFileName(invoice);
          console.log(`Processing invoice: ${invoice.invoiceNumber}, fileName: ${fileName}`);
          
          // Generate PDF bytes
          const pdfBytes = await generatePDFBytes(invoice);
          console.log(`Generated PDF bytes for invoice: ${invoice.invoiceNumber}`);
          
          // Add to zip
          zip.file(fileName, pdfBytes);
          console.log(`Added to ZIP: ${fileName}`);
          
          // Mark as downloaded
          await markAsDownloadedMutation.mutateAsync(invoice.id);
          console.log(`Marked as downloaded: ${invoice.invoiceNumber}`);
        } catch (invoiceError) {
          console.error(`Error processing invoice ${invoice.invoiceNumber}:`, invoiceError);
          throw invoiceError;
        }
      }
      
      // Generate zip file
      console.log('Generating final ZIP file...');
      const zipContent = await zip.generateAsync({ type: 'blob' });
      console.log('ZIP file generated successfully');
      
      // Create download link
      const url = URL.createObjectURL(zipContent);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MP_Beauty_Invoices_${format(new Date(), "yyyyMMdd")}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `Downloaded ${undownloadedInvoices.length} invoices as a ZIP file`,
      });
    } catch (error) {
      console.error('Error in downloadAllPdfs:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to generate ZIP file for download",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingAll(false);
    }
  };

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
      return id;
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/invoices'] });
      await queryClient.cancelQueries({ queryKey: ['/api/invoices/undownloaded'] });

      // Snapshot the previous values
      const previousInvoices = queryClient.getQueryData<InvoiceData[]>(['/api/invoices']);
      const previousUndownloaded = queryClient.getQueryData<InvoiceData[]>(['/api/invoices/undownloaded']);

      // Optimistically update both queries
      if (previousInvoices) {
        queryClient.setQueryData<InvoiceData[]>(
          ['/api/invoices'],
          previousInvoices.filter(invoice => invoice.id !== id)
        );
      }
      if (previousUndownloaded) {
        queryClient.setQueryData<InvoiceData[]>(
          ['/api/invoices/undownloaded'],
          previousUndownloaded.filter(invoice => invoice.id !== id)
        );
      }

      return { previousInvoices, previousUndownloaded };
    },
    onError: (err, id, context) => {
      // Roll back both queries on error
      if (context?.previousInvoices) {
        queryClient.setQueryData(['/api/invoices'], context.previousInvoices);
      }
      if (context?.previousUndownloaded) {
        queryClient.setQueryData(['/api/invoices/undownloaded'], context.previousUndownloaded);
      }
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices/undownloaded'] });
    },
  });

  // Delete invoice function
  const deleteInvoice = async (id: number) => {
    await deleteInvoiceMutation.mutateAsync(id);
  };

  return {
    invoices: allInvoices,
    undownloadedInvoices,
    isLoading: isLoading || createInvoiceMutation.isPending || processCSVMutation.isPending,
    isProcessingCSV: processCSVMutation.isPending,
    isCreatingInvoice: createInvoiceMutation.isPending,
    isDownloadingInvoice: (invoiceNumber: string) => downloadingIds.has(invoiceNumber),
    isDownloadingAll,
    createInvoice,
    processCSV,
    downloadPdf,
    downloadAllPdfs,
    deleteInvoice
  };
}

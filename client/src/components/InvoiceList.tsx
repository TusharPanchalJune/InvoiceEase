import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import InvoiceCard from "@/components/InvoiceCard";
import { Skeleton } from "@/components/ui/skeleton";

interface InvoiceListProps {
  invoices: InvoiceData[];
  isLoading: boolean;
  onDownload: (invoice: InvoiceData) => Promise<void>;
  onDownloadAll: () => Promise<void>;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ 
  invoices, 
  isLoading, 
  onDownload,
  onDownloadAll
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Generated Invoices</h3>
        {invoices.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-primary-600 bg-primary-50 hover:bg-primary-100 border-primary-200"
            onClick={onDownloadAll}
          >
            <i className="ri-download-2-line mr-1"></i> Download All
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <InvoiceListSkeleton />
          <InvoiceListSkeleton />
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 p-4 mb-4">
            <i className="ri-file-list-3-line text-3xl text-gray-400"></i>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices generated</h3>
          <p className="mt-1 text-sm text-gray-500">Upload a CSV file or create an invoice manually to get started.</p>
        </div>
      ) : (
        <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2">
          {invoices.map((invoice) => (
            <InvoiceCard 
              key={invoice.invoiceNumber} 
              invoice={invoice} 
              onDownload={() => onDownload(invoice)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const InvoiceListSkeleton = () => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <div className="bg-primary-500 p-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-24 bg-white/20" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-20 bg-white/20" />
          <Skeleton className="h-3 w-16 bg-white/20" />
        </div>
      </div>
    </div>
    
    <div className="p-4 space-y-4">
      <Skeleton className="h-5 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="border-t border-b border-gray-200 py-4 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
    
    <div className="bg-gray-100 p-4 flex justify-end">
      <Skeleton className="h-9 w-36 rounded-md" />
    </div>
  </div>
);

export default InvoiceList;

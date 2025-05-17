import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface InvoiceCardProps {
  invoice: InvoiceData;
  onDownload: () => Promise<void>;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onDownload }) => {
  const formattedDate = invoice.createdAt 
    ? format(new Date(invoice.createdAt), "MMMM d, yyyy") 
    : format(new Date(), "MMMM d, yyyy");

  return (
    <div className="invoice-preview bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      {/* Invoice Header */}
      <div className="bg-primary-500 text-white p-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold font-invoice">INVOICE</h4>
          <div className="text-right">
            <p className="text-sm opacity-90">{invoice.invoiceNumber}</p>
            <p className="text-xs opacity-75">{formattedDate}</p>
          </div>
        </div>
      </div>
      
      {/* Invoice Content */}
      <div className="p-4 font-invoice">
        {/* Company Info */}
        <div className="mb-6">
          <p className="font-bold text-lg">MP Beauty Association</p>
        </div>
        
        {/* Customer Info */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">BILLED TO</p>
          <p className="font-medium">{invoice.customerName}</p>
          <p className="text-sm text-gray-600">{invoice.customerContact}</p>
        </div>
        
        {/* Services */}
        <div className="border-t border-b border-gray-200 py-4 my-4">
          <div className="flex justify-between mb-2">
            <p className="text-sm font-medium">Description</p>
            <p className="text-sm font-medium">Amount</p>
          </div>
          <div className="flex justify-between">
            <p>{invoice.description}</p>
            <p>${invoice.totalAmount.toFixed(2)}</p>
          </div>
        </div>
        
        {/* Total */}
        <div className="space-y-1 text-right">
          <div className="flex justify-between text-sm">
            <p>Amount Paid:</p>
            <p>${invoice.amountPaid.toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-sm">
            <p>Due Amount:</p>
            <p>${invoice.dueAmount.toFixed(2)}</p>
          </div>
          <div className="flex justify-between font-medium text-base">
            <p>Total Amount:</p>
            <p>${invoice.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      {/* Invoice Footer */}
      <div className="bg-gray-100 p-4 flex justify-end">
        <Button 
          size="sm" 
          onClick={onDownload}
          className="flex items-center"
        >
          <i className="ri-download-line mr-1"></i> Download PDF
        </Button>
      </div>
    </div>
  );
};

export default InvoiceCard;

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
    <div className="invoice-preview bg-white rounded-lg overflow-hidden border border-gray-200">
      {/* Invoice Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold text-lg mb-1">MP Beauty Association</p>
            <p className="text-sm text-gray-600">Phone: (020) 000-0000</p>
          </div>
          <div className="text-right">
            <h4 className="text-2xl font-semibold text-gray-500 font-invoice mb-4">INVOICE</h4>
            <table className="ml-auto text-sm border-collapse">
              <tbody>
                <tr>
                  <td className="border border-gray-300 bg-gray-100 px-3 py-1 font-medium">INVOICE #</td>
                  <td className="border border-gray-300 px-3 py-1">{invoice.invoiceNumber}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 bg-gray-100 px-3 py-1 font-medium">DATE</td>
                  <td className="border border-gray-300 px-3 py-1">{formattedDate}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Invoice Content */}
      <div className="p-6 font-invoice">
        {/* Customer Info */}
        <div className="mb-6">
          <div className="bg-gray-100 px-3 py-2 mb-2 font-medium">BILL TO</div>
          <p className="font-medium">{invoice.customerName}</p>
          <p className="text-sm text-gray-600">{invoice.customerContact}</p>
        </div>
        
        {/* Services */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left">DESCRIPTION</th>
              <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-right w-32">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">{invoice.description}</td>
              <td className="border border-gray-300 px-4 py-2 text-right">₹{invoice.totalAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="border-l border-r border-gray-300 px-4 py-6"></td>
              <td className="border-l border-r border-gray-300 px-4"></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2 text-right font-medium">Amount Paid:</td>
              <td className="border border-gray-300 px-4 py-2 text-right">₹{invoice.amountPaid.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2 text-right font-medium">Due Amount:</td>
              <td className="border border-gray-300 px-4 py-2 text-right">₹{invoice.dueAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2 text-right font-medium">TOTAL</td>
              <td className="border border-gray-300 px-4 py-2 text-right font-bold">₹{invoice.totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        {/* Thank you note */}
        <p className="text-center text-sm text-gray-600 mb-4">Thank you for your business!</p>
      </div>
      
      {/* Invoice Footer */}
      <div className="bg-gray-100 p-4 flex justify-end border-t border-gray-200">
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

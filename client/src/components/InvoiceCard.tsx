import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface InvoiceCardProps {
  invoice: InvoiceData;
  onDownload: () => Promise<void>;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onDownload }) => {
  const formattedDate = invoice.createdAt 
    ? format(new Date(invoice.createdAt), "MM/dd/yyyy") 
    : format(new Date(), "MM/dd/yyyy");

  return (
    <div className="invoice-preview bg-white rounded-lg overflow-hidden border border-gray-300">
      {/* Invoice Header */}
      <div className="p-4 border-b border-gray-300">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold">MP Beauty Association</p>
            {/* <p className="text-sm text-gray-500">[Street Address]</p>
            <p className="text-sm text-gray-500">[City, ST ZIP]</p>
            <p className="text-sm text-gray-500">Phone: (000) 000-0000</p> */}
          </div>
          <div className="text-right">
            <p className="text-2xl text-gray-400 font-bold">INVOICE</p>
          </div>
        </div>
      </div>
      
      {/* Invoice Number and Date */}
      <div className="px-4 py-2">
        <div className="flex">
          <div className="w-1/2"></div>
          <div className="w-1/2">
            <div className="grid grid-cols-2 border border-gray-300">
              <div className="p-2 bg-gray-100 border-r border-gray-300 font-medium text-center">INVOICE #</div>
              <div className="p-2 bg-gray-100 font-medium text-center">DATE</div>
              <div className="p-2 border-r border-t border-gray-300 text-center">{invoice.invoiceNumber}</div>
              <div className="p-2 border-t border-gray-300 text-center">{formattedDate}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Customer Info */}
      <div className="p-4">
        <div className="border border-gray-300 bg-gray-100 p-2 mb-1">
          <p className="font-medium">BILL TO</p>
        </div>
        <div className="pl-1">
          <p className="font-medium">{invoice.customerName}</p>
          {/* <p className="text-sm text-gray-600">[Company Name]</p>
          <p className="text-sm text-gray-600">[Street Address]</p>
          <p className="text-sm text-gray-600">[City, ST ZIP]</p> */}
          <p className="text-sm text-gray-600">{invoice.customerContact}</p>
          {/* <p className="text-sm text-gray-600">[Email Address]</p> */}
        </div>
      </div>
      
      {/* Services/Description Table */}
      <div className="px-4 pb-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left border border-gray-300 w-3/4">DESCRIPTION</th>
              <th className="p-2 text-right border border-gray-300 w-1/4">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border border-gray-300">{invoice.description}</td>
              <td className="p-2 text-right border border-gray-300">Rs. {Number(invoice.totalAmount).toFixed(2)}</td>
            </tr>
            <tr>
              <td className="p-2 border border-gray-300 text-gray-600">Amount Paid</td>
              <td className="p-2 text-right border border-gray-300 text-green-600">Rs. {Number(invoice.amountPaid).toFixed(2)}</td>
            </tr>
            <tr>
              <td className="p-2 border border-gray-300 text-gray-600">Due Amount</td>
              <td className="p-2 text-right border border-gray-300 text-red-600">Rs. {Number(invoice.dueAmount).toFixed(2)}</td>
            </tr>
            {/* Add empty row to match template */}
            <tr>
              <td className="p-2 border border-gray-300 h-8"></td>
              <td className="p-2 text-right border border-gray-300"></td>
            </tr>
            <tr>
              <td className="p-2 border border-gray-300 text-center italic">Thank you for your business!</td>
              <td className="p-2 border border-gray-300">
                <div className="flex justify-between font-bold">
                  <span>TOTAL</span>
                  <span>Rs. {Number(invoice.totalAmount).toFixed(2)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Invoice Footer */}
      <div className="px-4 pb-4 text-center text-sm text-gray-600">
        {/* <p>If you have any questions about this invoice, please contact</p>
        <p>[Name, Phone, email@address.com]</p> */}
      </div>
      
      {/* Download Button */}
      <div className="bg-gray-100 p-4 flex justify-end border-t border-gray-300">
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

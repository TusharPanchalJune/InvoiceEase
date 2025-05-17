import { useState } from "react";
import TabNavigation from "@/components/TabNavigation";
import CSVUploadForm from "@/components/CSVUploadForm";
import ManualInvoiceForm from "@/components/ManualInvoiceForm";
import InvoiceList from "@/components/InvoiceList";
import { useInvoices } from "@/hooks/useInvoices";

type TabType = "csv" | "manual";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("csv");
  const { 
    invoices, 
    isLoading, 
    createInvoice, 
    processCSV, 
    downloadPdf, 
    downloadAllPdfs 
  } = useInvoices();

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">MP Beauty Association</h1>
            </div>
            <h2 className="text-lg font-medium text-gray-600">Invoice Generator</h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Left Column - Input Section */}
          <div className="mb-8 lg:mb-0">
            <CSVUploadForm 
              isVisible={activeTab === "csv"} 
              handleUpload={processCSV} 
            />
            <ManualInvoiceForm 
              isVisible={activeTab === "manual"} 
              handleSubmit={createInvoice}
            />
          </div>

          {/* Right Column - Generated Invoices */}
          <div>
            <InvoiceList 
              invoices={invoices} 
              isLoading={isLoading} 
              onDownload={downloadPdf}
              onDownloadAll={downloadAllPdfs}
            />
          </div>
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

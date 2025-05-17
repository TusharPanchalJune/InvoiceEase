import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getSampleCSV } from "@/utils/sample-csv";

interface CSVUploadFormProps {
  isVisible: boolean;
  handleUpload: (file: File) => Promise<void>;
}

const CSVUploadForm: React.FC<CSVUploadFormProps> = ({ isVisible, handleUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  if (!isVisible) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleProcess = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await handleUpload(file);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleCSV = getSampleCSV();
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload CSV File</h3>
        <p className="text-sm text-gray-600 mb-6">
          Upload a CSV file with the following columns: Customer Name, Customer Contact Number, Payment For, Amount Paid, Due Amount.
        </p>
        
        {/* File Upload Zone */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragging ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-500"
          } ${file ? "border-primary-500 bg-primary-50" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? (
            <>
              <i className="ri-file-text-line text-4xl text-primary-500 mb-2"></i>
              <p className="text-gray-800 font-medium">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">File selected - click "Process CSV" to generate invoices</p>
            </>
          ) : (
            <>
              <i className="ri-upload-cloud-2-line text-4xl text-gray-400 mb-2"></i>
              <p className="text-gray-600 mb-2">Drag and drop your CSV file here</p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <Button size="sm" className="cursor-pointer">
                <i className="ri-file-upload-line mr-2"></i>
                Browse Files
              </Button>
              <input 
                type="file" 
                id="csv-file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <p className="mt-2 text-xs text-gray-500">Maximum file size: 5MB</p>
            </>
          )}
        </div>

        {/* Sample CSV Template */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Sample CSV Format</h4>
            <button 
              type="button" 
              className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center"
              onClick={downloadSampleCSV}
            >
              <i className="ri-download-line mr-1"></i> Download Template
            </button>
          </div>
          <div className="mt-2 bg-gray-50 p-3 rounded-md overflow-x-auto">
            <code className="text-xs text-gray-800">
              Customer Name,Customer Contact Number,Payment For,Amount Paid,Due Amount<br />
              John Doe,+1 (555) 123-4567,Hair Treatment,75.00,25.00<br />
              Jane Smith,+1 (555) 987-6543,Facial and Massage,120.00,0.00
            </code>
          </div>
        </div>
      </div>

      {/* Processing Button */}
      <Button 
        className="w-full" 
        onClick={handleProcess}
        disabled={!file || isUploading}
      >
        {isUploading ? (
          <>
            <i className="ri-loader-4-line animate-spin mr-2"></i> Processing...
          </>
        ) : (
          <>
            <i className="ri-file-list-3-line mr-2"></i> Process CSV and Generate Invoices
          </>
        )}
      </Button>
    </div>
  );
};

export default CSVUploadForm;

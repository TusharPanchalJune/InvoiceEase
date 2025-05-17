import { CSVRow } from "@/types/invoice";

export async function parseCSV(file: File): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          return reject(new Error("Failed to read file content"));
        }
        
        // Split into lines and handle various line endings (CRLF, LF)
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        if (lines.length < 2) {
          return reject(new Error("CSV file must contain at least a header row and one data row"));
        }
        
        // Get headers (first row)
        const headers = lines[0].split(',').map(header => header.trim());
        
        // Check required headers
        const requiredHeaders = [
          'Customer Name', 
          'Customer Contact Number', 
          'Payment For', 
          'Amount Paid', 
          'Due Amount'
        ];
        
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        
        if (missingHeaders.length > 0) {
          return reject(new Error(`CSV is missing required columns: ${missingHeaders.join(', ')}`));
        }
        
        // Parse each data row
        const rows: CSVRow[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(',').map(value => value.trim());
          
          // Make sure we have enough values
          if (values.length !== headers.length) {
            return reject(new Error(`Row ${i} has ${values.length} values, but ${headers.length} were expected`));
          }
          
          // Create an object with header keys and corresponding values
          const row = headers.reduce((obj, header, index) => {
            obj[header as keyof CSVRow] = values[index];
            return obj;
          }, {} as Record<string, string>) as CSVRow;
          
          // Validate row data
          if (!row['Customer Name']) {
            return reject(new Error(`Row ${i} is missing Customer Name`));
          }
          if (!row['Customer Contact Number']) {
            return reject(new Error(`Row ${i} is missing Customer Contact Number`));
          }
          if (!row['Payment For']) {
            return reject(new Error(`Row ${i} is missing Payment For`));
          }
          
          // Validate amounts
          const amountPaid = parseFloat(row['Amount Paid']);
          const dueAmount = parseFloat(row['Due Amount']);
          
          if (isNaN(amountPaid)) {
            return reject(new Error(`Row ${i} has invalid Amount Paid: ${row['Amount Paid']}`));
          }
          if (isNaN(dueAmount)) {
            return reject(new Error(`Row ${i} has invalid Due Amount: ${row['Due Amount']}`));
          }
          
          rows.push(row);
        }
        
        resolve(rows);
      } catch (error) {
        reject(new Error("Failed to parse CSV file. Please ensure the file is in the correct format."));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading the file. Please try again."));
    };
    
    reader.readAsText(file);
  });
}

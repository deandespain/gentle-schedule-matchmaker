
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Caregiver, Client } from '@/types/scheduler';

interface SpreadsheetUploadProps {
  type: 'caregivers' | 'clients';
  onDataImport: (data: Caregiver[] | Client[]) => void;
}

export const SpreadsheetUpload: React.FC<SpreadsheetUploadProps> = ({ type, onDataImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const headers = type === 'caregivers' 
      ? ['Name', 'Address', 'Phone', 'Monday_Start', 'Monday_End', 'Tuesday_Start', 'Tuesday_End', 'Wednesday_Start', 'Wednesday_End', 'Thursday_Start', 'Thursday_End', 'Friday_Start', 'Friday_End', 'Saturday_Start', 'Saturday_End', 'Sunday_Start', 'Sunday_End', 'Exclusions']
      : ['Name', 'Address', 'Phone', 'Monday_Start', 'Monday_End', 'Tuesday_Start', 'Tuesday_End', 'Wednesday_Start', 'Wednesday_End', 'Thursday_Start', 'Thursday_End', 'Friday_Start', 'Friday_End', 'Saturday_Start', 'Saturday_End', 'Sunday_Start', 'Sunday_End', 'Exclusions'];

    // Add sample data row
    const sampleRow = type === 'caregivers'
      ? ['John Doe', '123 Main St', '555-0123', '09:00', '17:00', '09:00', '17:00', '', '', '10:00', '16:00', '09:00', '17:00', '', '', '', '', 'client_1;client_2']
      : ['Jane Smith', '456 Oak Ave', '555-0456', '08:00', '12:00', '08:00', '12:00', '14:00', '18:00', '', '', '08:00', '12:00', '', '', '', '', 'caregiver_1'];

    const csvContent = headers.join(',') + '\n' + sampleRow.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_template.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: `${type} template has been downloaded successfully.`,
    });
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const processFile = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Starting file processing...');
      const text = await file.text();
      console.log('File content:', text.substring(0, 200) + '...');
      
      const rows = parseCSV(text);
      console.log('Parsed rows:', rows);
      
      if (rows.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);
      console.log('Headers:', headers);
      console.log('Data rows:', dataRows);

      const processedData = dataRows.map((row, index) => {
        console.log(`Processing row ${index}:`, row);
        
        const id = `${type}_${Date.now()}_${index}`;
        const name = row[0]?.trim() || '';
        const address = row[1]?.trim() || '';
        const phone = row[2]?.trim() || '';
        
        if (!name) {
          console.warn(`Row ${index} missing name, skipping`);
          return null;
        }
        
        // Process weekly schedule - days in order: monday, tuesday, wednesday, thursday, friday, saturday, sunday
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
        const weeklySchedule = days.map((day, dayIndex) => {
          const startTime = row[3 + dayIndex * 2]?.trim() || '';
          const endTime = row[4 + dayIndex * 2]?.trim() || '';
          
          console.log(`Day ${day}: start=${startTime}, end=${endTime}`);
          
          return {
            day: day,
            slots: (startTime && endTime) ? [{
              start: startTime,
              end: endTime
            }] : []
          };
        });

        // Process exclusions - handle both semicolon and comma separated values
        const exclusionsText = row[17]?.trim() || '';
        const exclusions = exclusionsText ? 
          exclusionsText.split(/[;,]/).map(s => s.trim()).filter(Boolean) : 
          [];

        console.log('Processed exclusions:', exclusions);

        const processedItem = {
          id,
          name,
          address,
          phone,
          weeklySchedule,
          exclusions
        };
        
        console.log('Processed item:', processedItem);
        return processedItem;
      }).filter(Boolean); // Remove null entries

      console.log('Final processed data:', processedData);

      if (processedData.length === 0) {
        throw new Error('No valid data rows found in the CSV file');
      }

      onDataImport(processedData as any);
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${processedData.length} ${type}.`,
      });

      setFile(null);
      // Reset the file input
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "There was an error processing the file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Upload {type === 'caregivers' ? 'Caregivers' : 'Clients'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-file">CSV File</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              console.log('File selected:', selectedFile?.name);
              setFile(selectedFile);
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>

          <Button
            onClick={processFile}
            disabled={!file || isProcessing}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Upload & Import'}
          </Button>
        </div>

        <div className="bg-muted p-3 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">Format Requirements:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Use 24-hour time format (e.g., 09:00, 17:30)</li>
                <li>Leave time fields empty if not available</li>
                <li>Separate multiple exclusions with semicolons</li>
                <li>Include Name, Address, and Phone (required fields)</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

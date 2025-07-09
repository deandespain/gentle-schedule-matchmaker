import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CaregiverForm } from '@/components/CaregiverForm';
import { SpreadsheetUpload } from '@/components/SpreadsheetUpload';
import { Caregiver } from '@/types/scheduler';
import { useToast } from '@/hooks/use-toast';

const Caregivers = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const { toast } = useToast();

  // Load caregivers from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('caregivers');
    if (stored) {
      setCaregivers(JSON.parse(stored));
    }
  }, []);

  // Save caregivers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('caregivers', JSON.stringify(caregivers));
  }, [caregivers]);

  const handleAddCaregiver = (caregiver: Caregiver) => {
    setCaregivers(prev => [...prev, caregiver]);
    toast({
      title: "Caregiver Added",
      description: `${caregiver.name} has been added successfully.`,
    });
  };

  const handleCaregiversImport = (importedCaregivers: Caregiver[]) => {
    setCaregivers(prev => [...prev, ...importedCaregivers]);
    toast({
      title: "Caregivers Imported",
      description: `${importedCaregivers.length} caregivers have been imported.`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Caregivers</h1>
          <p className="text-muted-foreground">
            Add and manage caregiver information and schedules
          </p>
        </div>

        <div className="flex justify-center gap-6">
          <CaregiverForm onSubmit={handleAddCaregiver} />
          <SpreadsheetUpload type="caregivers" onDataImport={handleCaregiversImport} />
        </div>
        
        {caregivers.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Added Caregivers ({caregivers.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caregivers.map((caregiver) => (
                <Card key={caregiver.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{caregiver.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Address:</strong> {caregiver.address}</p>
                      <p><strong>Phone:</strong> {caregiver.phone}</p>
                      <p><strong>Available Days:</strong> {caregiver.weeklySchedule.length}</p>
                      {caregiver.exclusions.length > 0 && (
                        <p><strong>Exclusions:</strong> {caregiver.exclusions.length} client(s)</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Caregivers;
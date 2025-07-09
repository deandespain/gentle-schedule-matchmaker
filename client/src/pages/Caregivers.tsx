import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CaregiverForm } from '@/components/CaregiverForm';
import { SpreadsheetUpload } from '@/components/SpreadsheetUpload';
import { Caregiver, Client } from '@/types/scheduler';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, UserPlus, Shuffle } from 'lucide-react';
import { generateSampleCaregivers } from '@/utils/sampleDataGenerator';

const Caregivers = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingCaregiver, setEditingCaregiver] = useState<Caregiver | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const storedCaregivers = localStorage.getItem('caregivers');
    const storedClients = localStorage.getItem('clients');
    if (storedCaregivers) {
      setCaregivers(JSON.parse(storedCaregivers));
    }
    if (storedClients) {
      setClients(JSON.parse(storedClients));
    }
  }, []);

  // Save caregivers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('caregivers', JSON.stringify(caregivers));
  }, [caregivers]);

  const handleAddCaregiver = (caregiver: Caregiver) => {
    setCaregivers(prev => [...prev, caregiver]);
    setIsAddDialogOpen(false);
    toast({
      title: "Caregiver Added",
      description: `${caregiver.name} has been added successfully.`,
    });
  };

  const handleUpdateCaregiver = (updatedCaregiver: Caregiver) => {
    setCaregivers(prev => prev.map(c => c.id === updatedCaregiver.id ? updatedCaregiver : c));
    setIsEditDialogOpen(false);
    setEditingCaregiver(null);
    toast({
      title: "Caregiver Updated",
      description: `${updatedCaregiver.name} has been updated successfully.`,
    });
  };

  const handleDeleteCaregiver = (id: string) => {
    setCaregivers(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Caregiver Deleted",
      description: "Caregiver has been removed successfully.",
    });
  };

  const handleEditCaregiver = (caregiver: Caregiver) => {
    setEditingCaregiver(caregiver);
    setIsEditDialogOpen(true);
  };

  const handleCaregiversImport = (importedCaregivers: Caregiver[]) => {
    setCaregivers(prev => [...prev, ...importedCaregivers]);
    toast({
      title: "Caregivers Imported",
      description: `${importedCaregivers.length} caregivers have been imported.`,
    });
  };

  const handleGenerateSampleData = () => {
    const sampleCaregivers = generateSampleCaregivers(8);
    setCaregivers(sampleCaregivers);
    toast({
      title: "Sample Data Generated",
      description: `${sampleCaregivers.length} sample caregivers have been created with different shift types.`,
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

        <div className="flex justify-center gap-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Caregiver
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Caregiver</DialogTitle>
              </DialogHeader>
              <CaregiverForm 
                onSubmit={handleAddCaregiver} 
                clients={clients}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Caregiver</DialogTitle>
              </DialogHeader>
              {editingCaregiver && (
                <CaregiverForm 
                  onSubmit={handleUpdateCaregiver} 
                  caregiver={editingCaregiver}
                  clients={clients}
                  onCancel={() => {
                    setIsEditDialogOpen(false);
                    setEditingCaregiver(null);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          <SpreadsheetUpload type="caregivers" onDataImport={handleCaregiversImport} />

          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleGenerateSampleData}
            className="flex items-center gap-2"
          >
            <Shuffle className="w-5 h-5" />
            Generate Sample Data
          </Button>
        </div>
        
        {caregivers.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Added Caregivers ({caregivers.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caregivers.map((caregiver) => (
                <Card key={caregiver.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {caregiver.name}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCaregiver(caregiver)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCaregiver(caregiver.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Address:</strong> {caregiver.address}</p>
                      <p><strong>Phone:</strong> {caregiver.phone}</p>
                      <p><strong>Shift Type:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                          caregiver.shiftType === 'part-time' ? 'bg-blue-100 text-blue-800' :
                          caregiver.shiftType === 'mid-time' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {caregiver.shiftType === 'part-time' ? 'Part-time (2h max)' :
                           caregiver.shiftType === 'mid-time' ? 'Mid-time (4h max)' :
                           'Anytime (full days)'}
                        </span>
                      </p>
                      <p><strong>Available Days:</strong> {caregiver.weeklySchedule.filter(d => d.slots.length > 0).length}</p>
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
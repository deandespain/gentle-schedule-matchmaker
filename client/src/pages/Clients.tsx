import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ClientForm } from '@/components/ClientForm';
import { SpreadsheetUpload } from '@/components/SpreadsheetUpload';
import { Client, Caregiver } from '@/types/scheduler';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, UserPlus, Shuffle } from 'lucide-react';
import { generateSampleClients } from '@/utils/sampleDataGenerator';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const storedClients = localStorage.getItem('clients');
    const storedCaregivers = localStorage.getItem('caregivers');
    if (storedClients) {
      setClients(JSON.parse(storedClients));
    }
    if (storedCaregivers) {
      setCaregivers(JSON.parse(storedCaregivers));
    }
  }, []);

  // Save clients to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  const handleAddClient = (client: Client) => {
    setClients(prev => [...prev, client]);
    setIsAddDialogOpen(false);
    toast({
      title: "Client Added",
      description: `${client.name} has been added successfully.`,
    });
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setIsEditDialogOpen(false);
    setEditingClient(null);
    toast({
      title: "Client Updated",
      description: `${updatedClient.name} has been updated successfully.`,
    });
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Client Deleted",
      description: "Client has been removed successfully.",
    });
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsEditDialogOpen(true);
  };

  const handleClientsImport = (importedClients: Client[]) => {
    setClients(prev => [...prev, ...importedClients]);
    toast({
      title: "Clients Imported",
      description: `${importedClients.length} clients have been imported.`,
    });
  };

  const handleGenerateSampleData = () => {
    const sampleClients = generateSampleClients(6);
    setClients(sampleClients);
    toast({
      title: "Sample Data Generated",
      description: `${sampleClients.length} sample clients have been created with care needs.`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Add and manage client information and care requirements
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <ClientForm 
                onSubmit={handleAddClient} 
                caregivers={caregivers}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Client</DialogTitle>
              </DialogHeader>
              {editingClient && (
                <ClientForm 
                  onSubmit={handleUpdateClient} 
                  client={editingClient}
                  caregivers={caregivers}
                  onCancel={() => {
                    setIsEditDialogOpen(false);
                    setEditingClient(null);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          <SpreadsheetUpload type="clients" onDataImport={handleClientsImport} />

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
        
        {clients.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Added Clients ({clients.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <Card key={client.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {client.name}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClient(client)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClient(client.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Address:</strong> {client.address}</p>
                      <p><strong>Phone:</strong> {client.phone}</p>
                      <p><strong>Care Schedule:</strong> {client.weeklySchedule.filter(d => d.slots.length > 0).length} days</p>
                      {client.exclusions.length > 0 && (
                        <p><strong>Exclusions:</strong> {client.exclusions.length} caregiver(s)</p>
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

export default Clients;
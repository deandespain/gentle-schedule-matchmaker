import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientForm } from '@/components/ClientForm';
import { SpreadsheetUpload } from '@/components/SpreadsheetUpload';
import { Client } from '@/types/scheduler';
import { useToast } from '@/hooks/use-toast';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const { toast } = useToast();

  // Load clients from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('clients');
    if (stored) {
      setClients(JSON.parse(stored));
    }
  }, []);

  // Save clients to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  const handleAddClient = (client: Client) => {
    setClients(prev => [...prev, client]);
    toast({
      title: "Client Added",
      description: `${client.name} has been added successfully.`,
    });
  };

  const handleClientsImport = (importedClients: Client[]) => {
    setClients(prev => [...prev, ...importedClients]);
    toast({
      title: "Clients Imported",
      description: `${importedClients.length} clients have been imported.`,
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

        <div className="flex justify-center gap-6">
          <ClientForm onSubmit={handleAddClient} />
          <SpreadsheetUpload type="clients" onDataImport={handleClientsImport} />
        </div>
        
        {clients.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Added Clients ({clients.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <Card key={client.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Address:</strong> {client.address}</p>
                      <p><strong>Phone:</strong> {client.phone}</p>
                      <p><strong>Care Schedule:</strong> {client.weeklySchedule.length} days</p>
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
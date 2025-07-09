
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CaregiverForm } from '@/components/CaregiverForm';
import { ClientForm } from '@/components/ClientForm';
import { ScheduleOptions } from '@/components/ScheduleOptions';
import { SpreadsheetUpload } from '@/components/SpreadsheetUpload';
import { CalendarView } from '@/components/CalendarView';
import { Caregiver, Client, ScheduleOption } from '@/types/scheduler';
import { findMatches, generateScheduleOptions } from '@/utils/scheduleMatcher';
import { Users, UserCheck, Calendar, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [scheduleOptions, setScheduleOptions] = useState<ScheduleOption[]>([]);
  const [activeTab, setActiveTab] = useState('caregivers');
  const { toast } = useToast();

  const handleAddCaregiver = (caregiver: Caregiver) => {
    setCaregivers(prev => [...prev, caregiver]);
    toast({
      title: "Caregiver Added",
      description: `${caregiver.name} has been added successfully.`,
    });
  };

  const handleAddClient = (client: Client) => {
    setClients(prev => [...prev, client]);
    toast({
      title: "Client Added",
      description: `${client.name} has been added successfully.`,
    });
  };

  const handleCaregiversImport = (importedCaregivers: Caregiver[]) => {
    setCaregivers(prev => [...prev, ...importedCaregivers]);
  };

  const handleClientsImport = (importedClients: Client[]) => {
    setClients(prev => [...prev, ...importedClients]);
  };

  const generateSchedules = () => {
    if (caregivers.length === 0 || clients.length === 0) {
      toast({
        title: "Missing Data",
        description: "Please add at least one caregiver and one client before generating schedules.",
        variant: "destructive",
      });
      return;
    }

    const matches = findMatches(caregivers, clients);
    const options = generateScheduleOptions(matches);
    setScheduleOptions(options);
    setActiveTab('schedule');
    
    toast({
      title: "Schedules Generated",
      description: `Generated ${options.length} schedule options with ${matches.length} total matches.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Care Schedule Matchmaker
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Efficiently match caregivers with clients based on schedules, locations, and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-2xl font-bold">{caregivers.length}</p>
                <p className="text-sm text-muted-foreground">Caregivers</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <UserCheck className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-2xl font-bold">{clients.length}</p>
                <p className="text-sm text-muted-foreground">Clients</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Calendar className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-2xl font-bold">{scheduleOptions.length}</p>
                <p className="text-sm text-muted-foreground">Options</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <Button 
                onClick={generateSchedules} 
                className="w-full"
                disabled={caregivers.length === 0 || clients.length === 0}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Schedules
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="caregivers">Caregivers</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="schedule">Schedule Options</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="caregivers" className="space-y-6">
            <div className="flex justify-center gap-6">
              <CaregiverForm onSubmit={handleAddCaregiver} />
              <SpreadsheetUpload type="caregivers" onDataImport={handleCaregiversImport} />
            </div>
            
            {caregivers.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Added Caregivers</h3>
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
                          <p><strong>Available Days:</strong> {
                            caregiver.weeklySchedule.filter(day => day.slots.length > 0).length
                          }</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-center gap-6">
              <ClientForm onSubmit={handleAddClient} />
              <SpreadsheetUpload type="clients" onDataImport={handleClientsImport} />
            </div>
            
            {clients.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Added Clients</h3>
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
                          <p><strong>Care Needed:</strong> {
                            client.weeklySchedule.filter(day => day.slots.length > 0).length
                          } days</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-6">
            {scheduleOptions.length > 0 ? (
              <ScheduleOptions 
                options={scheduleOptions} 
                caregivers={caregivers} 
                clients={clients} 
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Schedules Generated Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Add caregivers and clients, then click "Generate Schedules" to see matching options.
                  </p>
                  <Button 
                    onClick={generateSchedules}
                    disabled={caregivers.length === 0 || clients.length === 0}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Schedules
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarView 
              scheduleOptions={scheduleOptions}
              caregivers={caregivers}
              clients={clients}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

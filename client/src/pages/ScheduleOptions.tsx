import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ScheduleOptions as ScheduleOptionsComponent } from '@/components/ScheduleOptions';
import { Caregiver, Client, ScheduleOption } from '@/types/scheduler';
import { findMatches, generateScheduleOptions } from '@/utils/scheduleMatcher';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';

const ScheduleOptions = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [scheduleOptions, setScheduleOptions] = useState<ScheduleOption[]>([]);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const storedCaregivers = localStorage.getItem('caregivers');
    const storedClients = localStorage.getItem('clients');
    const storedScheduleOptions = localStorage.getItem('scheduleOptions');
    
    if (storedCaregivers) setCaregivers(JSON.parse(storedCaregivers));
    if (storedClients) setClients(JSON.parse(storedClients));
    if (storedScheduleOptions) setScheduleOptions(JSON.parse(storedScheduleOptions));
  }, []);

  // Save schedule options to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('scheduleOptions', JSON.stringify(scheduleOptions));
  }, [scheduleOptions]);

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
    
    toast({
      title: "Schedules Generated",
      description: `Generated ${options.length} schedule options with ${matches.length} total matches.`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Schedule Options</h1>
            <p className="text-muted-foreground">
              Generate and review optimal caregiver-client scheduling options
            </p>
          </div>
          
          <Button 
            onClick={generateSchedules} 
            disabled={caregivers.length === 0 || clients.length === 0}
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Schedules
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold">{caregivers.length}</div>
            <div className="text-sm text-muted-foreground">Caregivers</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold">{clients.length}</div>
            <div className="text-sm text-muted-foreground">Clients</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold">{scheduleOptions.length}</div>
            <div className="text-sm text-muted-foreground">Options</div>
          </div>
        </div>

        {scheduleOptions.length > 0 ? (
          <ScheduleOptionsComponent 
            options={scheduleOptions} 
            caregivers={caregivers} 
            clients={clients} 
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No schedule options generated yet.</p>
            <p className="text-sm">Add caregivers and clients, then click "Generate Schedules" to begin.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ScheduleOptions;
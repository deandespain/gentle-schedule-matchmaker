import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { CalendarView as CalendarViewComponent } from '@/components/CalendarView';
import { Caregiver, Client, ScheduleOption } from '@/types/scheduler';
import { Calendar } from 'lucide-react';

const CalendarView = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [scheduleOptions, setScheduleOptions] = useState<ScheduleOption[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedCaregivers = localStorage.getItem('caregivers');
    const storedClients = localStorage.getItem('clients');
    const storedScheduleOptions = localStorage.getItem('scheduleOptions');
    
    if (storedCaregivers) setCaregivers(JSON.parse(storedCaregivers));
    if (storedClients) setClients(JSON.parse(storedClients));
    if (storedScheduleOptions) setScheduleOptions(JSON.parse(storedScheduleOptions));
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Calendar View</h1>
          <p className="text-muted-foreground">
            Visual representation of your generated schedule options
          </p>
        </div>

        {scheduleOptions.length > 0 ? (
          <CalendarViewComponent 
            scheduleOptions={scheduleOptions} 
            caregivers={caregivers} 
            clients={clients} 
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No schedule data available for calendar view.</p>
            <p className="text-sm">Generate schedule options first to see them in calendar format.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CalendarView;
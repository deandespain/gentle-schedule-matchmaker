
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScheduleOption, Caregiver, Client, Match } from '@/types/scheduler';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Users, AlertTriangle } from 'lucide-react';

interface CalendarViewProps {
  scheduleOptions: ScheduleOption[];
  caregivers: Caregiver[];
  clients: Client[];
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Color palette for caregivers
const CAREGIVER_COLORS = [
  'bg-red-500 text-white',
  'bg-blue-500 text-white',
  'bg-green-500 text-white',
  'bg-yellow-500 text-black',
  'bg-purple-500 text-white',
  'bg-pink-500 text-white',
  'bg-indigo-500 text-white',
  'bg-orange-500 text-white',
  'bg-teal-500 text-white',
  'bg-cyan-500 text-white',
  'bg-emerald-500 text-white',
  'bg-lime-500 text-black',
  'bg-amber-500 text-black',
  'bg-rose-500 text-white',
  'bg-violet-500 text-white',
  'bg-sky-500 text-white',
];

export const CalendarView: React.FC<CalendarViewProps> = ({
  scheduleOptions,
  caregivers,
  clients
}) => {
  const [selectedOption, setSelectedOption] = useState(0);

  const getCaregiverName = (id: string) => caregivers.find(c => c.id === id)?.name || 'Unknown';
  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown';

  const getCaregiverColor = (caregiverId: string) => {
    const index = caregivers.findIndex(c => c.id === caregiverId);
    return CAREGIVER_COLORS[index % CAREGIVER_COLORS.length];
  };

  const getCurrentOption = () => {
    return scheduleOptions[selectedOption] || { matches: [] };
  };

  const getMatchesForClient = (clientId: string, day: string) => {
    return getCurrentOption().matches.filter(match => 
      match.clientId === clientId && match.day === day
    );
  };

  const getClientNeeds = (clientId: string, day: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return [];
    
    const daySchedule = client.weeklySchedule.find(d => d.day === day);
    return daySchedule?.slots || [];
  };

  const formatTimeSlot = (slot: { start: string; end: string }) => {
    return `${slot.start}-${slot.end}`;
  };

  const getUniqueCaregiversInOption = () => {
    const currentOption = getCurrentOption();
    const caregiverIds = new Set(currentOption.matches.map(match => match.caregiverId));
    return Array.from(caregiverIds).map(id => caregivers.find(c => c.id === id)).filter(Boolean);
  };

  // Calculate missing coverage for each client
  const calculateMissingCoverage = () => {
    const currentOption = getCurrentOption();
    const missingCoverage = [];
    
    for (const client of clients) {
      for (const day of DAYS) {
        const clientNeeds = getClientNeeds(client.id, day);
        const matches = getMatchesForClient(client.id, day);
        
        // Calculate total client needs for this day
        const totalNeededMinutes = clientNeeds.reduce((total, slot) => {
          const start = new Date(`2000-01-01T${slot.start}`);
          const end = new Date(`2000-01-01T${slot.end}`);
          return total + (end.getTime() - start.getTime()) / (1000 * 60);
        }, 0);
        
        // Calculate total coverage provided
        const totalCoveredMinutes = matches.reduce((total, match) => {
          const start = new Date(`2000-01-01T${match.timeSlot.start}`);
          const end = new Date(`2000-01-01T${match.timeSlot.end}`);
          return total + (end.getTime() - start.getTime()) / (1000 * 60);
        }, 0);
        
        const missingMinutes = totalNeededMinutes - totalCoveredMinutes;
        
        if (missingMinutes > 0) {
          missingCoverage.push({
            clientId: client.id,
            clientName: client.name,
            day,
            missingHours: missingMinutes / 60,
            totalNeededHours: totalNeededMinutes / 60,
            coveredHours: totalCoveredMinutes / 60
          });
        }
      }
    }
    
    return missingCoverage;
  };

  const getTotalMissingHours = () => {
    return calculateMissingCoverage().reduce((total, item) => total + item.missingHours, 0);
  };

  const getClientsWithMissingCoverage = () => {
    const missing = calculateMissingCoverage();
    const clientsMap = new Map();
    
    missing.forEach(item => {
      if (!clientsMap.has(item.clientId)) {
        clientsMap.set(item.clientId, {
          clientId: item.clientId,
          clientName: item.clientName,
          totalMissingHours: 0,
          days: []
        });
      }
      
      const client = clientsMap.get(item.clientId);
      client.totalMissingHours += item.missingHours;
      client.days.push({
        day: item.day,
        missingHours: item.missingHours,
        totalNeededHours: item.totalNeededHours,
        coveredHours: item.coveredHours
      });
    });
    
    return Array.from(clientsMap.values());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Client Schedule View
        </h2>
        
        {scheduleOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedOption(Math.max(0, selectedOption - 1))}
              disabled={selectedOption === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">
              Option {selectedOption + 1} of {scheduleOptions.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedOption(Math.min(scheduleOptions.length - 1, selectedOption + 1))}
              disabled={selectedOption === scheduleOptions.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Coverage Summary */}
      {scheduleOptions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Missing Hours</p>
                  <p className="text-2xl font-bold text-red-600">{getTotalMissingHours().toFixed(1)}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clients Needing Coverage</p>
                  <p className="text-2xl font-bold text-orange-600">{getClientsWithMissingCoverage().length}</p>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Coverage Details</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="mt-1">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        View Missing
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          Missing Coverage Details
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {getClientsWithMissingCoverage().map(client => (
                          <Card key={client.clientId} className="border-l-4 border-l-red-500">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-lg">{client.clientName}</h4>
                                <Badge variant="destructive">
                                  {client.totalMissingHours.toFixed(1)} hours missing
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                {client.days.map(day => (
                                  <div key={day.day} className="flex justify-between items-center text-sm">
                                    <span className="font-medium capitalize">{day.day}</span>
                                    <div className="flex gap-2">
                                      <span className="text-green-600">
                                        {day.coveredHours.toFixed(1)}h covered
                                      </span>
                                      <span className="text-red-600">
                                        {day.missingHours.toFixed(1)}h missing
                                      </span>
                                      <span className="text-gray-500">
                                        of {day.totalNeededHours.toFixed(1)}h needed
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {getClientsWithMissingCoverage().length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p>All clients have full coverage!</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {scheduleOptions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Schedule Options Available</h3>
            <p className="text-muted-foreground">
              Generate schedule options to view them in the calendar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Caregiver Legend */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Caregiver Legend - Option {selectedOption + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {getUniqueCaregiversInOption().map((caregiver) => (
                  <div key={caregiver.id} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${getCaregiverColor(caregiver.id)}`}></div>
                    <span className="text-sm truncate">{caregiver.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Client Schedule Grid */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Client Schedule Grid</span>
                <Badge variant="secondary">
                  {getCurrentOption().matches?.length || 0} assignments
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-2 border-b font-medium min-w-[200px]">Client</th>
                      {DAY_LABELS.map(day => (
                        <th key={day} className="text-center p-2 border-b font-medium min-w-[120px]">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(client => (
                      <tr key={client.id} className="border-b">
                        <td className="p-2 font-medium">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {client.address}
                              </div>
                            </div>
                          </div>
                        </td>
                        {DAYS.map(day => {
                          const clientNeeds = getClientNeeds(client.id, day);
                          const matches = getMatchesForClient(client.id, day);
                          const missingCoverage = calculateMissingCoverage().find(
                            m => m.clientId === client.id && m.day === day
                          );
                          
                          return (
                            <td key={day} className="p-2 text-center">
                              <div className="space-y-1">
                                {/* Client's available time slots */}
                                {clientNeeds.map((slot, slotIndex) => (
                                  <div key={`need-${slotIndex}`} className="text-xs text-muted-foreground mb-1">
                                    {formatTimeSlot(slot)}
                                  </div>
                                ))}
                                
                                {/* Caregiver assignments */}
                                {matches.map((match, matchIndex) => (
                                  <div
                                    key={`match-${matchIndex}`}
                                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCaregiverColor(match.caregiverId)}`}
                                    title={`${getCaregiverName(match.caregiverId)} - ${formatTimeSlot(match.timeSlot)}`}
                                  >
                                    <div className="truncate max-w-[100px]">
                                      {getCaregiverName(match.caregiverId)}
                                    </div>
                                    <div className="text-[10px] opacity-75">
                                      {formatTimeSlot(match.timeSlot)}
                                    </div>
                                  </div>
                                ))}
                                
                                {/* Missing coverage indicator */}
                                {missingCoverage && (
                                  <div className="inline-block px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                    <div className="flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" />
                                      <span>Missing</span>
                                    </div>
                                    <div className="text-[10px] opacity-75">
                                      {missingCoverage.missingHours.toFixed(1)}h
                                    </div>
                                  </div>
                                )}
                                
                                {/* Empty state */}
                                {clientNeeds.length === 0 && (
                                  <div className="text-xs text-muted-foreground">-</div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

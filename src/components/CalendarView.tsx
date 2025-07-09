
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScheduleOption, Caregiver, Client, Match } from '@/types/scheduler';
import { Calendar, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';

interface CalendarViewProps {
  scheduleOptions: ScheduleOption[];
  caregivers: Caregiver[];
  clients: Client[];
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export const CalendarView: React.FC<CalendarViewProps> = ({
  scheduleOptions,
  caregivers,
  clients
}) => {
  const [selectedOption, setSelectedOption] = useState(0);

  const getCaregiverName = (id: string) => caregivers.find(c => c.id === id)?.name || 'Unknown';
  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown';

  const getTimeSlotPosition = (timeSlot: { start: string; end: string }) => {
    const startHour = parseInt(timeSlot.start.split(':')[0]);
    const startMinute = parseInt(timeSlot.start.split(':')[1]);
    const endHour = parseInt(timeSlot.end.split(':')[0]);
    const endMinute = parseInt(timeSlot.end.split(':')[1]);

    const startPosition = (startHour + startMinute / 60) * 40; // 40px per hour
    const duration = (endHour + endMinute / 60) - (startHour + startMinute / 60);
    const height = duration * 40;

    return { top: startPosition, height };
  };

  const getCurrentOption = () => {
    return scheduleOptions[selectedOption] || { matches: [] };
  };

  const getMatchesForDay = (day: string) => {
    return getCurrentOption().matches.filter(match => match.day === day);
  };

  const getCaregiverAvailability = (caregiverId: string, day: string) => {
    const caregiver = caregivers.find(c => c.id === caregiverId);
    if (!caregiver) return [];
    
    const daySchedule = caregiver.weeklySchedule.find(d => d.day === day);
    return daySchedule?.slots || [];
  };

  const getClientNeeds = (clientId: string, day: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return [];
    
    const daySchedule = client.weeklySchedule.find(d => d.day === day);
    return daySchedule?.slots || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Schedule Calendar View
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Weekly Schedule - Option {selectedOption + 1}</span>
              <Badge variant="secondary">
                {getCurrentOption().matches?.length || 0} matches
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-2">
              {/* Time column */}
              <div className="space-y-1">
                <div className="h-8 flex items-center text-xs font-medium text-muted-foreground">
                  Time
                </div>
                {HOURS.map(hour => (
                  <div key={hour} className="h-10 flex items-center text-xs text-muted-foreground border-t">
                    {hour}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="relative">
                  <div className="h-8 flex items-center justify-center text-sm font-medium bg-muted rounded">
                    {DAY_LABELS[dayIndex]}
                  </div>
                  
                  <div className="relative" style={{ height: '960px' }}> {/* 24 hours * 40px */}
                    {/* Hour grid lines */}
                    {HOURS.map((_, hourIndex) => (
                      <div
                        key={hourIndex}
                        className="absolute w-full border-t border-muted"
                        style={{ top: hourIndex * 40 }}
                      />
                    ))}

                    {/* Caregiver availability blocks */}
                    {caregivers.map(caregiver => 
                      getCaregiverAvailability(caregiver.id, day).map((slot, slotIndex) => {
                        const position = getTimeSlotPosition(slot);
                        return (
                          <div
                            key={`caregiver-${caregiver.id}-${slotIndex}`}
                            className="absolute bg-emerald-100 border border-emerald-300 rounded-sm p-1 text-xs text-emerald-800 font-medium z-10"
                            style={{
                              top: position.top,
                              height: Math.max(position.height, 24),
                              width: '45%',
                              left: '2%',
                            }}
                          >
                            <div className="truncate">{caregiver.name}</div>
                            <div className="text-[10px] opacity-75">{slot.start}-{slot.end}</div>
                          </div>
                        );
                      })
                    )}

                    {/* Client needs blocks */}
                    {clients.map(client => 
                      getClientNeeds(client.id, day).map((slot, slotIndex) => {
                        const position = getTimeSlotPosition(slot);
                        return (
                          <div
                            key={`client-${client.id}-${slotIndex}`}
                            className="absolute bg-blue-100 border border-blue-300 rounded-sm p-1 text-xs text-blue-800 font-medium z-10"
                            style={{
                              top: position.top,
                              height: Math.max(position.height, 24),
                              width: '45%',
                              right: '2%',
                            }}
                          >
                            <div className="truncate">{client.name}</div>
                            <div className="text-[10px] opacity-75">{slot.start}-{slot.end}</div>
                          </div>
                        );
                      })
                    )}

                    {/* Matches (connections between caregiver and client) */}
                    {getMatchesForDay(day).map((match, matchIndex) => {
                      const position = getTimeSlotPosition(match.timeSlot);
                      return (
                        <div
                          key={`match-${matchIndex}`}
                          className="absolute w-full bg-primary text-primary-foreground text-xs p-1 rounded shadow-sm border border-primary z-20 opacity-90"
                          style={{
                            top: position.top,
                            height: Math.max(position.height, 32),
                          }}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <User className="w-3 h-3" />
                            <span className="font-medium truncate">
                              {getCaregiverName(match.caregiverId)}
                            </span>
                          </div>
                          <div className="text-xs opacity-90 truncate">
                            → {getClientName(match.clientId)}
                          </div>
                          <div className="flex items-center gap-1 text-xs opacity-75">
                            <Clock className="w-2 h-2" />
                            <span>{match.timeSlot.start}-{match.timeSlot.end}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-100 border border-emerald-300 rounded"></div>
                <span>Caregiver Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Client Needs Care</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <span>Scheduled Match</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

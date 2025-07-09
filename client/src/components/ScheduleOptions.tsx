
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScheduleOption, Caregiver, Client } from '@/types/scheduler';
import { Clock, MapPin, User, Award } from 'lucide-react';

interface ScheduleOptionsProps {
  options: ScheduleOption[];
  caregivers: Caregiver[];
  clients: Client[];
}

export const ScheduleOptions: React.FC<ScheduleOptionsProps> = ({ options, caregivers, clients }) => {
  const getCaregiverName = (id: string) => caregivers.find(c => c.id === id)?.name || 'Unknown';
  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Schedule Options</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {options.map((option) => (
          <Card key={option.option} className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Option {option.option}</span>
                <Badge variant="secondary">
                  <Award className="w-4 h-4 mr-1" />
                  {option.efficiency.toFixed(0)}% efficient
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {option.matches.length} matches • Total Score: {option.totalScore.toFixed(1)}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {option.matches.map((match, index) => (
                  <Card key={index} className="p-3 bg-muted/50">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">
                          {getCaregiverName(match.caregiverId)}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium text-sm">
                          {getClientName(match.clientId)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="capitalize">{match.day}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{match.timeSlot.start} - {match.timeSlot.end}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          Score: {match.score.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {option.matches.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No matches found for this option
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

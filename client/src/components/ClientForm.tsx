
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Client, Caregiver, DaySchedule, TimeSlot } from '@/types/scheduler';
import { Plus, Trash2, X } from 'lucide-react';

interface ClientFormProps {
  onSubmit: (client: Client) => void;
  client?: Client;
  caregivers?: Caregiver[];
  onCancel?: () => void;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, client, caregivers = [], onCancel }) => {
  const [formData, setFormData] = useState<Partial<Client>>(
    client || {
      name: '',
      address: '',
      phone: '',
      weeklySchedule: DAYS.map(day => ({ day: day as any, slots: [] })),
      exclusions: []
    }
  );

  const [selectedCaregiver, setSelectedCaregiver] = useState<string>('');

  const addTimeSlot = (dayIndex: number) => {
    const newSchedule = [...(formData.weeklySchedule || [])];
    newSchedule[dayIndex].slots.push({ start: '09:00', end: '17:00' });
    setFormData({ ...formData, weeklySchedule: newSchedule });
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const newSchedule = [...(formData.weeklySchedule || [])];
    newSchedule[dayIndex].slots.splice(slotIndex, 1);
    setFormData({ ...formData, weeklySchedule: newSchedule });
  };

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    const newSchedule = [...(formData.weeklySchedule || [])];
    newSchedule[dayIndex].slots[slotIndex][field] = value;
    setFormData({ ...formData, weeklySchedule: newSchedule });
  };

  const addExclusion = () => {
    if (selectedCaregiver && !formData.exclusions?.includes(selectedCaregiver)) {
      setFormData({
        ...formData,
        exclusions: [...(formData.exclusions || []), selectedCaregiver]
      });
      setSelectedCaregiver('');
    }
  };

  const removeExclusion = (caregiverId: string) => {
    setFormData({
      ...formData,
      exclusions: (formData.exclusions || []).filter(id => id !== caregiverId)
    });
  };

  const getCaregiverName = (caregiverId: string) => {
    return caregivers.find(c => c.id === caregiverId)?.name || 'Unknown Caregiver';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.address && formData.phone) {
      onSubmit({
        id: client?.id || Math.random().toString(36).substr(2, 9),
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        weeklySchedule: formData.weeklySchedule || [],
        exclusions: formData.exclusions || []
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{client ? 'Edit' : 'Add'} Client</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-lg font-semibold">Care Schedule Needed</Label>
            <div className="space-y-4 mt-2">
              {DAYS.map((day, dayIndex) => (
                <Card key={day} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium capitalize">{day}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeSlot(dayIndex)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Time Slot
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.weeklySchedule?.[dayIndex]?.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'start', e.target.value)}
                          className="w-32"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'end', e.target.value)}
                          className="w-32"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Exclusions Section */}
          <div>
            <Label className="text-lg font-semibold">Caregiver Exclusions</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Select caregivers this client doesn't want to work with
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Select value={selectedCaregiver} onValueChange={setSelectedCaregiver}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a caregiver to exclude" />
                  </SelectTrigger>
                  <SelectContent>
                    {caregivers
                      .filter(caregiver => !formData.exclusions?.includes(caregiver.id))
                      .map(caregiver => (
                        <SelectItem key={caregiver.id} value={caregiver.id}>
                          {caregiver.name} - {caregiver.address}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  onClick={addExclusion}
                  disabled={!selectedCaregiver}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.exclusions && formData.exclusions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.exclusions.map(caregiverId => (
                    <Badge key={caregiverId} variant="secondary" className="flex items-center gap-1">
                      {getCaregiverName(caregiverId)}
                      <button
                        type="button"
                        onClick={() => removeExclusion(caregiverId)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              {client ? 'Update' : 'Add'} Client
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};


export interface TimeSlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

export interface DaySchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  slots: TimeSlot[];
}

export interface Caregiver {
  id: string;
  name: string;
  address: string;
  phone: string;
  weeklySchedule: DaySchedule[];
  exclusions: string[]; // Client IDs they can't work with
}

export interface Client {
  id: string;
  name: string;
  address: string;
  phone: string;
  weeklySchedule: DaySchedule[];
  exclusions: string[]; // Caregiver IDs they don't want
}

export interface Match {
  caregiverId: string;
  clientId: string;
  day: string;
  timeSlot: TimeSlot;
  score: number; // Compatibility score
}

export interface ScheduleOption {
  option: number;
  matches: Match[];
  totalScore: number;
  efficiency: number;
}

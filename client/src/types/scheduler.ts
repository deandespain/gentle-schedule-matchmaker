
export interface TimeSlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

export interface DaySchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  slots: TimeSlot[];
}

export type ShiftType = 'part-time' | 'mid-time' | 'anytime';

export interface Caregiver {
  id: string;
  name: string;
  address: string;
  phone: string;
  weeklySchedule: DaySchedule[];
  exclusions: string[]; // Client IDs they can't work with
  shiftType: ShiftType; // part-time (2hrs max), mid-time (4hrs max), anytime (full days)
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

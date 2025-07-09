import { Caregiver, Client, ShiftType } from '@/types/scheduler';

const SAMPLE_NAMES = [
  'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Wilson', 'Jessica Brown',
  'Christopher Lee', 'Amanda Davis', 'Robert Garcia', 'Michelle Kim', 'John Martinez',
  'Ashley Taylor', 'Daniel Thompson', 'Lauren Anderson', 'Kevin White', 'Stephanie Clark'
];

const SAMPLE_ADDRESSES = [
  '123 Oak Street, Downtown', '456 Pine Ave, Westside', '789 Maple Drive, Eastside',
  '321 Elm Road, Northside', '654 Cedar Lane, Southside', '987 Birch Way, Midtown',
  '147 Willow Street, Uptown', '258 Spruce Ave, Riverside', '369 Aspen Drive, Hillside',
  '741 Poplar Road, Valley View', '852 Hickory Lane, Garden District', '963 Walnut Way, Heights',
  '159 Cherry Street, Old Town', '357 Peach Ave, New District', '486 Apple Drive, Park View'
];

const SAMPLE_PHONES = [
  '(555) 123-4567', '(555) 234-5678', '(555) 345-6789', '(555) 456-7890', '(555) 567-8901',
  '(555) 678-9012', '(555) 789-0123', '(555) 890-1234', '(555) 901-2345', '(555) 012-3456',
  '(555) 321-6547', '(555) 432-7658', '(555) 543-8769', '(555) 654-9870', '(555) 765-0981'
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const SHIFT_TYPES: ShiftType[] = ['part-time', 'mid-time', 'anytime'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomTimeSlot(minHour: number = 8, maxHour: number = 18, duration: number = 2): { start: string; end: string } {
  const startHour = Math.floor(Math.random() * (maxHour - minHour - duration)) + minHour;
  const endHour = startHour + duration;
  
  return {
    start: `${startHour.toString().padStart(2, '0')}:00`,
    end: `${endHour.toString().padStart(2, '0')}:00`
  };
}

function generateRandomSchedule(shiftType: ShiftType) {
  const schedule = DAYS.map(day => ({ day, slots: [] as any[] }));
  
  // Generate 3-5 random days of availability
  const availableDays = Math.floor(Math.random() * 3) + 3;
  const selectedDays = [...DAYS].sort(() => 0.5 - Math.random()).slice(0, availableDays);
  
  selectedDays.forEach(day => {
    const dayIndex = DAYS.indexOf(day);
    const slotsCount = Math.floor(Math.random() * 2) + 1; // 1-2 slots per day
    
    for (let i = 0; i < slotsCount; i++) {
      let duration = 2; // Default 2 hours
      
      if (shiftType === 'mid-time') {
        duration = Math.random() > 0.5 ? 3 : 4; // 3-4 hours
      } else if (shiftType === 'anytime') {
        duration = Math.floor(Math.random() * 6) + 3; // 3-8 hours
      }
      
      const timeSlot = generateRandomTimeSlot(8, 18, duration);
      schedule[dayIndex].slots.push(timeSlot);
    }
  });
  
  return schedule;
}

export function generateSampleCaregivers(count: number = 8): Caregiver[] {
  const caregivers: Caregiver[] = [];
  const usedNames = new Set<string>();
  const usedAddresses = new Set<string>();
  const usedPhones = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let name = getRandomElement(SAMPLE_NAMES);
    while (usedNames.has(name)) {
      name = getRandomElement(SAMPLE_NAMES);
    }
    usedNames.add(name);
    
    let address = getRandomElement(SAMPLE_ADDRESSES);
    while (usedAddresses.has(address)) {
      address = getRandomElement(SAMPLE_ADDRESSES);
    }
    usedAddresses.add(address);
    
    let phone = getRandomElement(SAMPLE_PHONES);
    while (usedPhones.has(phone)) {
      phone = getRandomElement(SAMPLE_PHONES);
    }
    usedPhones.add(phone);
    
    const shiftType = getRandomElement(SHIFT_TYPES);
    
    caregivers.push({
      id: Math.random().toString(36).substr(2, 9),
      name,
      address,
      phone,
      shiftType,
      weeklySchedule: generateRandomSchedule(shiftType),
      exclusions: []
    });
  }
  
  return caregivers;
}

export function generateSampleClients(count: number = 6): Client[] {
  const clients: Client[] = [];
  const usedNames = new Set<string>();
  const usedAddresses = new Set<string>();
  const usedPhones = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let name = getRandomElement(SAMPLE_NAMES);
    while (usedNames.has(name)) {
      name = getRandomElement(SAMPLE_NAMES);
    }
    usedNames.add(name);
    
    let address = getRandomElement(SAMPLE_ADDRESSES);
    while (usedAddresses.has(address)) {
      address = getRandomElement(SAMPLE_ADDRESSES);
    }
    usedAddresses.add(address);
    
    let phone = getRandomElement(SAMPLE_PHONES);
    while (usedPhones.has(phone)) {
      phone = getRandomElement(SAMPLE_PHONES);
    }
    usedPhones.add(phone);
    
    clients.push({
      id: Math.random().toString(36).substr(2, 9),
      name,
      address,
      phone,
      weeklySchedule: generateRandomSchedule('mid-time'), // Clients typically need consistent care
      exclusions: []
    });
  }
  
  return clients;
}
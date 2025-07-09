
import { Caregiver, Client, Match, ScheduleOption, TimeSlot } from '@/types/scheduler';

// Calculate distance between two addresses (simplified - in real app would use Google Maps API)
function calculateDistance(address1: string, address2: string): number {
  // Simplified distance calculation - in reality you'd use a proper geocoding service
  return Math.random() * 50; // Random distance between 0-50 miles for demo
}

// Check if two time slots overlap
function timeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  const start1 = new Date(`2000-01-01T${slot1.start}`);
  const end1 = new Date(`2000-01-01T${slot1.end}`);
  const start2 = new Date(`2000-01-01T${slot2.start}`);
  const end2 = new Date(`2000-01-01T${slot2.end}`);

  return start1 < end2 && start2 < end1;
}

// Calculate overlap duration in minutes
function calculateOverlapDuration(slot1: TimeSlot, slot2: TimeSlot): number {
  if (!timeSlotsOverlap(slot1, slot2)) return 0;

  const start1 = new Date(`2000-01-01T${slot1.start}`);
  const end1 = new Date(`2000-01-01T${slot1.end}`);
  const start2 = new Date(`2000-01-01T${slot2.start}`);
  const end2 = new Date(`2000-01-01T${slot2.end}`);

  const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
  const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));

  return (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60); // minutes
}

// Find all possible matches between caregivers and clients
export function findMatches(caregivers: Caregiver[], clients: Client[]): Match[] {
  const matches: Match[] = [];

  caregivers.forEach(caregiver => {
    clients.forEach(client => {
      // Check exclusions
      if (caregiver.exclusions.includes(client.id) || client.exclusions.includes(caregiver.id)) {
        return;
      }

      // Check each day
      caregiver.weeklySchedule.forEach(caregiverDay => {
        const clientDay = client.weeklySchedule.find(d => d.day === caregiverDay.day);
        if (!clientDay) return;

        // Check time slot overlaps
        caregiverDay.slots.forEach(caregiverSlot => {
          clientDay.slots.forEach(clientSlot => {
            if (timeSlotsOverlap(caregiverSlot, clientSlot)) {
              const distance = calculateDistance(caregiver.address, client.address);
              const overlapDuration = calculateOverlapDuration(caregiverSlot, clientSlot);
              
              // Calculate score based on overlap duration and proximity
              const score = overlapDuration * (1 / (distance + 1)); // Higher overlap and closer = better score

              matches.push({
                caregiverId: caregiver.id,
                clientId: client.id,
                day: caregiverDay.day,
                timeSlot: {
                  start: clientSlot.start,
                  end: clientSlot.end
                },
                score
              });
            }
          });
        });
      });
    });
  });

  return matches.sort((a, b) => b.score - a.score);
}

// Generate top 3 schedule options
export function generateScheduleOptions(matches: Match[]): ScheduleOption[] {
  const options: ScheduleOption[] = [];
  
  // Option 1: Highest scoring matches (greedy approach)
  const option1Matches = selectGreedyMatches(matches);
  options.push({
    option: 1,
    matches: option1Matches,
    totalScore: option1Matches.reduce((sum, match) => sum + match.score, 0),
    efficiency: calculateEfficiency(option1Matches)
  });

  // Option 2: Balanced approach (considering both score and distribution)
  const option2Matches = selectBalancedMatches(matches);
  options.push({
    option: 2,
    matches: option2Matches,
    totalScore: option2Matches.reduce((sum, match) => sum + match.score, 0),
    efficiency: calculateEfficiency(option2Matches)
  });

  // Option 3: Maximum coverage (try to match as many clients as possible)
  const option3Matches = selectMaxCoverageMatches(matches);
  options.push({
    option: 3,
    matches: option3Matches,
    totalScore: option3Matches.reduce((sum, match) => sum + match.score, 0),
    efficiency: calculateEfficiency(option3Matches)
  });

  return options;
}

function selectGreedyMatches(matches: Match[]): Match[] {
  const selected: Match[] = [];
  const usedCaregivers = new Set<string>();
  const usedClients = new Set<string>();

  for (const match of matches) {
    const key = `${match.caregiverId}-${match.day}-${match.timeSlot.start}`;
    const clientKey = `${match.clientId}-${match.day}-${match.timeSlot.start}`;
    
    if (!usedCaregivers.has(key) && !usedClients.has(clientKey)) {
      selected.push(match);
      usedCaregivers.add(key);
      usedClients.add(clientKey);
    }
  }

  return selected;
}

function selectBalancedMatches(matches: Match[]): Match[] {
  // Similar to greedy but with some randomization for diversity
  const shuffled = [...matches].sort(() => Math.random() - 0.5);
  return selectGreedyMatches(shuffled);
}

function selectMaxCoverageMatches(matches: Match[]): Match[] {
  const selected: Match[] = [];
  const usedCaregivers = new Set<string>();
  const clientCoverage = new Map<string, number>();

  // Initialize client coverage
  matches.forEach(match => {
    if (!clientCoverage.has(match.clientId)) {
      clientCoverage.set(match.clientId, 0);
    }
  });

  // Prioritize uncovered clients
  const sortedMatches = [...matches].sort((a, b) => {
    const aCoverage = clientCoverage.get(a.clientId) || 0;
    const bCoverage = clientCoverage.get(b.clientId) || 0;
    
    if (aCoverage !== bCoverage) {
      return aCoverage - bCoverage; // Less covered clients first
    }
    return b.score - a.score; // Then by score
  });

  for (const match of sortedMatches) {
    const key = `${match.caregiverId}-${match.day}-${match.timeSlot.start}`;
    
    if (!usedCaregivers.has(key)) {
      selected.push(match);
      usedCaregivers.add(key);
      clientCoverage.set(match.clientId, (clientCoverage.get(match.clientId) || 0) + 1);
    }
  }

  return selected;
}

function calculateEfficiency(matches: Match[]): number {
  if (matches.length === 0) return 0;
  
  // Simple efficiency calculation based on average score
  const avgScore = matches.reduce((sum, match) => sum + match.score, 0) / matches.length;
  return Math.min(100, avgScore * 10); // Scale to 0-100
}

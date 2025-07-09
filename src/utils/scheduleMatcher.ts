
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

// Check if a client slot is fully covered by a caregiver slot
function isClientSlotFullyCovered(clientSlot: TimeSlot, caregiverSlot: TimeSlot): boolean {
  const clientStart = new Date(`2000-01-01T${clientSlot.start}`);
  const clientEnd = new Date(`2000-01-01T${clientSlot.end}`);
  const caregiverStart = new Date(`2000-01-01T${caregiverSlot.start}`);
  const caregiverEnd = new Date(`2000-01-01T${caregiverSlot.end}`);

  return caregiverStart <= clientStart && caregiverEnd >= clientEnd;
}

// Find all possible matches between caregivers and clients
export function findMatches(caregivers: Caregiver[], clients: Client[]): Match[] {
  const matches: Match[] = [];

  clients.forEach(client => {
    // Process each client's needs first (client priority)
    client.weeklySchedule.forEach(clientDay => {
      clientDay.slots.forEach(clientSlot => {
        caregivers.forEach(caregiver => {
          // Check exclusions
          if (caregiver.exclusions.includes(client.id) || client.exclusions.includes(caregiver.id)) {
            return;
          }

          const caregiverDay = caregiver.weeklySchedule.find(d => d.day === clientDay.day);
          if (!caregiverDay) return;

          // Check time slot overlaps with caregiver availability
          caregiverDay.slots.forEach(caregiverSlot => {
            if (timeSlotsOverlap(caregiverSlot, clientSlot)) {
              const distance = calculateDistance(caregiver.address, client.address);
              const overlapDuration = calculateOverlapDuration(caregiverSlot, clientSlot);
              const isFullyCovered = isClientSlotFullyCovered(clientSlot, caregiverSlot);
              
              // Calculate score prioritizing full coverage of client needs
              let score = overlapDuration * (1 / (distance + 1));
              
              // Bonus for full coverage of client slot
              if (isFullyCovered) {
                score *= 2; // Double the score for full coverage
              }
              
              // Additional bonus for exact time match
              if (caregiverSlot.start === clientSlot.start && caregiverSlot.end === clientSlot.end) {
                score *= 1.5;
              }

              matches.push({
                caregiverId: caregiver.id,
                clientId: client.id,
                day: clientDay.day,
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

// Generate top 3 schedule options prioritizing client coverage
export function generateScheduleOptions(matches: Match[]): ScheduleOption[] {
  const options: ScheduleOption[] = [];
  
  // Option 1: Client-first approach (prioritize complete client coverage)
  const option1Matches = selectClientFirstMatches(matches);
  options.push({
    option: 1,
    matches: option1Matches,
    totalScore: option1Matches.reduce((sum, match) => sum + match.score, 0),
    efficiency: calculateEfficiency(option1Matches)
  });

  // Option 2: Balanced approach with client priority
  const option2Matches = selectBalancedClientPriorityMatches(matches);
  options.push({
    option: 2,
    matches: option2Matches,
    totalScore: option2Matches.reduce((sum, match) => sum + match.score, 0),
    efficiency: calculateEfficiency(option2Matches)
  });

  // Option 3: Maximum client coverage
  const option3Matches = selectMaxClientCoverageMatches(matches);
  options.push({
    option: 3,
    matches: option3Matches,
    totalScore: option3Matches.reduce((sum, match) => sum + match.score, 0),
    efficiency: calculateEfficiency(option3Matches)
  });

  return options;
}

function selectClientFirstMatches(matches: Match[]): Match[] {
  const selected: Match[] = [];
  const coveredClientSlots = new Set<string>();
  const usedCaregiverTime = new Map<string, Set<string>>();

  // Group matches by client and day for prioritization
  const clientMatches = new Map<string, Match[]>();
  matches.forEach(match => {
    const key = `${match.clientId}-${match.day}-${match.timeSlot.start}-${match.timeSlot.end}`;
    if (!clientMatches.has(key)) {
      clientMatches.set(key, []);
    }
    clientMatches.get(key)!.push(match);
  });

  // Process each client slot and find the best caregiver match
  for (const [clientSlotKey, clientSlotMatches] of clientMatches.entries()) {
    if (coveredClientSlots.has(clientSlotKey)) continue;

    // Sort by score to get best match first
    clientSlotMatches.sort((a, b) => b.score - a.score);

    for (const match of clientSlotMatches) {
      const caregiverKey = `${match.caregiverId}-${match.day}`;
      const timeKey = `${match.timeSlot.start}-${match.timeSlot.end}`;
      
      if (!usedCaregiverTime.has(caregiverKey)) {
        usedCaregiverTime.set(caregiverKey, new Set());
      }

      // Check if caregiver is available for this time slot
      if (!usedCaregiverTime.get(caregiverKey)!.has(timeKey)) {
        selected.push(match);
        coveredClientSlots.add(clientSlotKey);
        usedCaregiverTime.get(caregiverKey)!.add(timeKey);
        break; // Move to next client slot
      }
    }
  }

  return selected;
}

function selectBalancedClientPriorityMatches(matches: Match[]): Match[] {
  // Similar to client-first but with some randomization for variety
  const shuffledMatches = [...matches];
  
  // Shuffle within score tiers to add variety while maintaining quality
  const tiers = [
    shuffledMatches.filter(m => m.score >= 100),
    shuffledMatches.filter(m => m.score >= 50 && m.score < 100),
    shuffledMatches.filter(m => m.score < 50)
  ];
  
  const reorderedMatches = tiers.flatMap(tier => 
    tier.sort(() => Math.random() - 0.5)
  );
  
  return selectClientFirstMatches(reorderedMatches);
}

function selectMaxClientCoverageMatches(matches: Match[]): Match[] {
  const selected: Match[] = [];
  const clientCoverage = new Map<string, number>();
  const usedCaregiverTime = new Map<string, Set<string>>();

  // Initialize client coverage tracking
  matches.forEach(match => {
    const clientKey = match.clientId;
    if (!clientCoverage.has(clientKey)) {
      clientCoverage.set(clientKey, 0);
    }
  });

  // Sort matches prioritizing clients with least coverage
  const sortedMatches = [...matches].sort((a, b) => {
    const aCoverage = clientCoverage.get(a.clientId) || 0;
    const bCoverage = clientCoverage.get(b.clientId) || 0;
    
    if (aCoverage !== bCoverage) {
      return aCoverage - bCoverage; // Less covered clients first
    }
    return b.score - a.score; // Then by score
  });

  for (const match of sortedMatches) {
    const caregiverKey = `${match.caregiverId}-${match.day}`;
    const timeKey = `${match.timeSlot.start}-${match.timeSlot.end}`;
    
    if (!usedCaregiverTime.has(caregiverKey)) {
      usedCaregiverTime.set(caregiverKey, new Set());
    }

    if (!usedCaregiverTime.get(caregiverKey)!.has(timeKey)) {
      selected.push(match);
      usedCaregiverTime.get(caregiverKey)!.add(timeKey);
      clientCoverage.set(match.clientId, (clientCoverage.get(match.clientId) || 0) + 1);
    }
  }

  return selected;
}

function calculateEfficiency(matches: Match[]): number {
  if (matches.length === 0) return 0;
  
  // Calculate efficiency based on client coverage completeness and average score
  const avgScore = matches.reduce((sum, match) => sum + match.score, 0) / matches.length;
  const clientCoverage = new Set(matches.map(m => `${m.clientId}-${m.day}-${m.timeSlot.start}-${m.timeSlot.end}`));
  
  // Bonus for high client coverage
  const coverageBonus = clientCoverage.size * 5;
  
  return Math.min(100, (avgScore * 5) + coverageBonus);
}

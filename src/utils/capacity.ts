import { PracticeAttempt } from '../types';

export interface CapacityLevel {
  level: number;
  count: number;
  label: string;
  desc: string;
}

export const CAPACITY_LEVELS: CapacityLevel[] = [
  { level: 1, count: 5, label: '5 items', desc: 'Comfortable' },
  { level: 2, count: 10, label: '10 items', desc: 'Building skill' },
  { level: 3, count: 15, label: '15 items', desc: 'Strong recall' },
  { level: 4, count: 20, label: '20 items', desc: 'Advanced challenge' },
];

// Checks whether capacity level (1-4) is unlocked based on >=80% threshold
export function isCapacityLevelUnlocked(
  level: number,
  practiceHistory: PracticeAttempt[] = []
): boolean {
  if (level === 1) return true;
  const palaceAttempts = practiceHistory.filter((p) => p.techniqueId === 'palace');

  if (level === 2) {
    return palaceAttempts.some((p) => p.level === 1 && p.accuracy >= 80);
  }
  if (level === 3) {
    return palaceAttempts.some((p) => p.level === 2 && p.accuracy >= 80);
  }
  if (level === 4) {
    return palaceAttempts.some((p) => p.level === 3 && p.accuracy >= 80);
  }
  return false;
}

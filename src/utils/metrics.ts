import type { PracticeAttempt, ActiveRetentionMemory, RetentionReview } from '../types';

export interface RecallStrengthBreakdown {
  overallStrength: number | null; // null = "Not measured yet"
  immediateAccuracy: number | null; // 0 - 100
  retentionAccuracy: number | null; // 0 - 100
  capacityScore: number | null; // 0 - 100
  maxCapacityItems: number;
  totalPractices: number;
  totalRetentionReviews: number;
  stageLabel: string;
}

// Calculates Recall Strength (0-100) or null if unmeasured
export function calculateRecallStrength(
  practiceHistory: PracticeAttempt[] = [],
  retentionMemories: ActiveRetentionMemory[] = []
): RecallStrengthBreakdown {
  const totalPractices = practiceHistory.length;

  // Collect all retention reviews across memories
  const allReviews: RetentionReview[] = [];
  retentionMemories.forEach((mem) => {
    if (Array.isArray(mem.reviews)) {
      allReviews.push(...mem.reviews);
    }
  });
  const totalRetentionReviews = allReviews.length;

  // Case 1: Fresh user with no verified practice attempts and no retention reviews
  if (totalPractices === 0 && totalRetentionReviews === 0) {
    return {
      overallStrength: null,
      immediateAccuracy: null,
      retentionAccuracy: null,
      capacityScore: null,
      maxCapacityItems: 0,
      totalPractices: 0,
      totalRetentionReviews: 0,
      stageLabel: 'Not measured yet',
    };
  }

  // 1. Immediate Recall Accuracy (up to last 5 recent practices)
  let immediateAccuracy: number | null = null;
  let maxCapacityItems = 0;
  if (totalPractices > 0) {
    const recent = practiceHistory.slice(0, 5);
    const sumAcc = recent.reduce((sum, att) => {
      const acc =
        typeof att.accuracy === 'number' && !isNaN(att.accuracy)
          ? att.accuracy
          : att.totalItems > 0
          ? Math.round((att.correctItems / att.totalItems) * 100)
          : 0;
      return sum + Math.max(0, Math.min(100, acc));
    }, 0);
    immediateAccuracy = Math.round(sumAcc / recent.length);

    // Track max capacity items completed with at least 60% accuracy
    practiceHistory.forEach((att) => {
      const acc =
        typeof att.accuracy === 'number' && !isNaN(att.accuracy)
          ? att.accuracy
          : att.totalItems > 0
          ? (att.correctItems / att.totalItems) * 100
          : 0;
      if (acc >= 60 && att.totalItems > maxCapacityItems) {
        maxCapacityItems = att.totalItems;
      }
    });

    if (maxCapacityItems === 0 && practiceHistory.length > 0) {
      maxCapacityItems = Math.min(...practiceHistory.map((p) => p.totalItems || 5));
    }
  }

  // 2. Delayed Retention Check-in Accuracy
  let retentionAccuracy: number | null = null;
  if (totalRetentionReviews > 0) {
    const sumRet = allReviews.reduce((sum, rev) => {
      const pct = rev.total > 0 ? (rev.score / rev.total) * 100 : 0;
      return sum + Math.max(0, Math.min(100, pct));
    }, 0);
    retentionAccuracy = Math.round(sumRet / totalRetentionReviews);
  }

  // 3. Capacity Load Score (20 items = 100%)
  const capacityScore =
    maxCapacityItems > 0
      ? Math.min(100, Math.max(0, Math.round((maxCapacityItems / 20) * 100)))
      : null;

  // Proportional weighting across active components
  let weightedSum = 0;
  let totalWeight = 0;

  if (immediateAccuracy !== null) {
    weightedSum += immediateAccuracy * 0.4;
    totalWeight += 0.4;
  }
  if (retentionAccuracy !== null) {
    weightedSum += retentionAccuracy * 0.4;
    totalWeight += 0.4;
  }
  if (capacityScore !== null) {
    weightedSum += capacityScore * 0.2;
    totalWeight += 0.2;
  }

  const overallStrength =
    totalWeight > 0
      ? Math.max(0, Math.min(100, Math.round(weightedSum / totalWeight)))
      : null;

  let stageLabel = 'Not measured yet';
  if (overallStrength !== null) {
    if (overallStrength < 35) stageLabel = 'Calibrating';
    else if (overallStrength < 60) stageLabel = 'Building';
    else if (overallStrength < 80) stageLabel = 'Skilled';
    else stageLabel = 'Strong';
  }

  return {
    overallStrength,
    immediateAccuracy,
    retentionAccuracy,
    capacityScore,
    maxCapacityItems,
    totalPractices,
    totalRetentionReviews,
    stageLabel,
  };
}

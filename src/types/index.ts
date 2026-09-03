export type TechniqueType = 'palace' | 'linking' | 'peg';

export type MasteryLevel = 'beginner' | 'learner' | 'skilled' | 'advanced' | 'master';

export interface UserProfile {
  hasCompletedOnboarding: boolean;
  baselineScore: {
    total: number;
    recalled: number;
    date: string;
  } | null;
  streakDays: number;
  lastActiveDate: string;
}

export interface TechniqueProgress {
  techniqueId: TechniqueType;
  completedSteps: number; // 0 to 6
  masteryLevel: MasteryLevel;
  totalPractices: number;
  bestScore: number;
  averageAccuracy: number; // 0 - 100
}

export interface PalaceSpot {
  id: string;
  order: number;
  name: string;
  iconName: string;
}

export interface UserPalace {
  id: string;
  name: string;
  type: 'home' | 'school' | 'work' | 'route' | 'custom';
  iconName: string;
  spots: PalaceSpot[];
  createdAt: string;
}

export interface PracticeAttempt {
  id: string;
  techniqueId: TechniqueType;
  level: number; // 1 (5 items), 2 (10), 3 (15), 4 (20)
  totalItems: number;
  correctItems: number;
  accuracy: number; // percentage
  timestamp: string;
}

export interface RetentionReview {
  reviewDate: string;
  intervalDay: number; // 1, 3, 7, 14, 30
  score: number;
  total: number;
}

export interface ActiveRetentionMemory {
  id: string;
  palaceId: string;
  palaceName: string;
  encodedDate: string;
  items: {
    spotIndex: number;
    spotName: string;
    word: string;
    emoji: string;
    bizarreHint?: string;
  }[];
  reviews: RetentionReview[];
  nextReviewDate: string; // ISO string
  currentIntervalDay: number; // 1, 3, 7, 14, 30
  status: 'active' | 'graduated';
}

export interface AppStateData {
  profile: UserProfile;
  techniqueProgress: Record<TechniqueType, TechniqueProgress>;
  palaces: UserPalace[];
  practiceHistory: PracticeAttempt[];
  retentionMemories: ActiveRetentionMemory[];
}

export type ScreenName =
  | 'onboarding'
  | 'home'
  | 'learn'
  | 'techniqueDetail'
  | 'palaceBuilder'
  | 'practice'
  | 'practiceSession'
  | 'progress'
  | 'delayedRecall';

export interface NavigationState {
  currentScreen: ScreenName;
  params?: Record<string, any>;
  activeTab: 'home' | 'learn' | 'practice' | 'progress';
}

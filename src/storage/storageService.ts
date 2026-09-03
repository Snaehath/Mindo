import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppStateData, MasteryLevel, PracticeAttempt, TechniqueProgress, TechniqueType, UserPalace, UserProfile } from '../types';
import { defaultPalaces } from '../data/defaultPalaces';

const STORAGE_KEYS = {
  PROFILE: '@mindo_profile_v1',
  TECHNIQUES: '@mindo_techniques_v1',
  PALACES: '@mindo_palaces_v1',
  HISTORY: '@mindo_history_v1',
};

const defaultProfile: UserProfile = {
  hasCompletedOnboarding: false,
  baselineScore: null,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

const defaultTechniqueProgress: Record<TechniqueType, TechniqueProgress> = {
  palace: {
    techniqueId: 'palace',
    completedSteps: 1,
    masteryLevel: 'beginner',
    totalPractices: 0,
    bestScore: 0,
    averageAccuracy: 0,
  },
  linking: {
    techniqueId: 'linking',
    completedSteps: 0,
    masteryLevel: 'beginner',
    totalPractices: 0,
    bestScore: 0,
    averageAccuracy: 0,
  },
  peg: {
    techniqueId: 'peg',
    completedSteps: 0,
    masteryLevel: 'beginner',
    totalPractices: 0,
    bestScore: 0,
    averageAccuracy: 0,
  },
};

export const StorageService = {
  async loadAllData(): Promise<AppStateData> {
    try {
      const [profileRaw, techRaw, palacesRaw, histRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.TECHNIQUES),
        AsyncStorage.getItem(STORAGE_KEYS.PALACES),
        AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
      ]);

      const profile: UserProfile = profileRaw ? JSON.parse(profileRaw) : defaultProfile;
      const techniqueProgress: Record<TechniqueType, TechniqueProgress> = techRaw
        ? { ...defaultTechniqueProgress, ...JSON.parse(techRaw) }
        : defaultTechniqueProgress;
      const palaces: UserPalace[] = palacesRaw ? JSON.parse(palacesRaw) : defaultPalaces;
      const practiceHistory: PracticeAttempt[] = histRaw ? JSON.parse(histRaw) : [];

      // Update streak if today is a new active day
      const today = new Date().toISOString().split('T')[0];
      if (profile.lastActiveDate !== today) {
        const lastDate = new Date(profile.lastActiveDate);
        const currDate = new Date(today);
        const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          profile.streakDays += 1;
        } else if (diffDays > 1) {
          profile.streakDays = 1;
        }
        profile.lastActiveDate = today;
        await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      }

      return {
        profile,
        techniqueProgress,
        palaces,
        practiceHistory,
      };
    } catch (e) {
      console.warn('Storage load failed, returning defaults', e);
      return {
        profile: defaultProfile,
        techniqueProgress: defaultTechniqueProgress,
        palaces: defaultPalaces,
        practiceHistory: [],
      };
    }
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  async saveTechniqueProgress(progress: Record<TechniqueType, TechniqueProgress>): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TECHNIQUES, JSON.stringify(progress));
  },

  async savePalaces(palaces: UserPalace[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.PALACES, JSON.stringify(palaces));
  },

  async recordPractice(attempt: PracticeAttempt): Promise<{
    history: PracticeAttempt[];
    updatedTechnique: TechniqueProgress;
  }> {
    const rawHist = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    const history: PracticeAttempt[] = rawHist ? JSON.parse(rawHist) : [];
    history.unshift(attempt);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 100)));

    // Update technique progress
    const techRaw = await AsyncStorage.getItem(STORAGE_KEYS.TECHNIQUES);
    const techMap: Record<TechniqueType, TechniqueProgress> = techRaw
      ? { ...defaultTechniqueProgress, ...JSON.parse(techRaw) }
      : { ...defaultTechniqueProgress };

    const current = techMap[attempt.techniqueId] || defaultTechniqueProgress[attempt.techniqueId];
    const techAttempts = history.filter((h) => h.techniqueId === attempt.techniqueId);
    const totalPractices = techAttempts.length;
    const bestScore = Math.max(current.bestScore, attempt.correctItems);
    const averageAccuracy = Math.round(
      techAttempts.reduce((acc, curr) => acc + curr.accuracy, 0) / (totalPractices || 1)
    );

    // Compute mastery tier
    let masteryLevel: MasteryLevel = 'beginner';
    if (totalPractices >= 8 && averageAccuracy >= 85) {
      masteryLevel = 'master';
    } else if (totalPractices >= 5 && averageAccuracy >= 80) {
      masteryLevel = 'advanced';
    } else if (totalPractices >= 3 && averageAccuracy >= 70) {
      masteryLevel = 'skilled';
    } else if (totalPractices >= 1) {
      masteryLevel = 'learner';
    }

    const updatedTechnique: TechniqueProgress = {
      ...current,
      totalPractices,
      bestScore,
      averageAccuracy,
      masteryLevel,
    };

    techMap[attempt.techniqueId] = updatedTechnique;
    await AsyncStorage.setItem(STORAGE_KEYS.TECHNIQUES, JSON.stringify(techMap));

    return { history, updatedTechnique };
  },

  async resetAll(): Promise<AppStateData> {
    await AsyncStorage.clear();
    return {
      profile: defaultProfile,
      techniqueProgress: defaultTechniqueProgress,
      palaces: defaultPalaces,
      practiceHistory: [],
    };
  },
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ActiveRetentionMemory,
  AppStateData,
  MasteryLevel,
  PracticeAttempt,
  ScreenName,
  TechniqueProgress,
  TechniqueType,
  UserPalace,
  UserProfile,
} from '../types';
import { StorageService } from '../storage/storageService';

interface NavigationContextType {
  currentScreen: ScreenName;
  activeTab: 'home' | 'learn' | 'practice' | 'progress';
  params: Record<string, any>;
  navigate: (screen: ScreenName, params?: Record<string, any>) => void;
  switchTab: (tab: 'home' | 'learn' | 'practice' | 'progress') => void;
  goBack: () => void;
  canGoBack: boolean;

  // App Data & State
  isLoading: boolean;
  profile: UserProfile;
  techniqueProgress: Record<TechniqueType, TechniqueProgress>;
  palaces: UserPalace[];
  practiceHistory: PracticeAttempt[];
  retentionMemories: ActiveRetentionMemory[];
  activeRetentionMemory: ActiveRetentionMemory | undefined;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updatePalaces: (palaces: UserPalace[]) => Promise<void>;
  updateTechniqueStep: (tech: TechniqueType, step: number) => Promise<void>;
  recordPracticeAttempt: (attempt: PracticeAttempt) => Promise<void>;
  saveRetentionMemory: (memory: ActiveRetentionMemory) => Promise<void>;
  recordRetentionReview: (memoryId: string, score: number, total: number) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<Array<{ screen: ScreenName; params?: Record<string, any> }>>([]);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [activeTab, setActiveTab] = useState<'home' | 'learn' | 'practice' | 'progress'>('home');
  const [params, setParams] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [data, setData] = useState<AppStateData>({
    profile: {
      hasCompletedOnboarding: false,
      baselineScore: null,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
    },
    techniqueProgress: {
      palace: {
        techniqueId: 'palace',
        completedSteps: 1,
        masteryLevel: 'beginner',
        totalPractices: 0,
        bestScore: 0,
        averageAccuracy: 10,
      },
      linking: {
        techniqueId: 'linking',
        completedSteps: 0,
        masteryLevel: 'beginner',
        totalPractices: 0,
        bestScore: 0,
        averageAccuracy: 10,
      },
      peg: {
        techniqueId: 'peg',
        completedSteps: 0,
        masteryLevel: 'beginner',
        totalPractices: 0,
        bestScore: 0,
        averageAccuracy: 10,
      },
    },
    palaces: [],
    practiceHistory: [],
    retentionMemories: [],
  });

  useEffect(() => {
    async function init() {
      const stored = await StorageService.loadAllData();
      setData(stored);
      if (!stored.profile.hasCompletedOnboarding) {
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen('home');
      }
      setIsLoading(false);
    }
    init();
  }, []);

  const navigate = (screen: ScreenName, newParams: Record<string, any> = {}) => {
    setHistory((prev) => [...prev, { screen: currentScreen, params }]);
    setCurrentScreen(screen);
    setParams(newParams);

    // Map screen to tab if applicable
    if (screen === 'home') setActiveTab('home');
    if (screen === 'learn') setActiveTab('learn');
    if (screen === 'practice') setActiveTab('practice');
    if (screen === 'progress') setActiveTab('progress');
  };

  const switchTab = (tab: 'home' | 'learn' | 'practice' | 'progress') => {
    setActiveTab(tab);
    setCurrentScreen(tab);
    setParams({});
    setHistory([]);
  };

  const goBack = () => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setHistory((prev) => prev.slice(0, prev.length - 1));
      setCurrentScreen(previous.screen);
      setParams(previous.params || {});
      if (['home', 'learn', 'practice', 'progress'].includes(previous.screen)) {
        setActiveTab(previous.screen as any);
      }
    } else {
      switchTab('home');
    }
  };

  const updateProfile = async (partial: Partial<UserProfile>) => {
    const updated = { ...data.profile, ...partial };
    await StorageService.saveProfile(updated);
    setData((prev) => ({ ...prev, profile: updated }));
  };

  const updatePalaces = async (newPalaces: UserPalace[]) => {
    await StorageService.savePalaces(newPalaces);
    setData((prev) => ({ ...prev, palaces: newPalaces }));
  };

  const updateTechniqueStep = async (tech: TechniqueType, step: number) => {
    const curr = data.techniqueProgress[tech];
    const newSteps = Math.max(curr.completedSteps, step);
    let mastery: MasteryLevel = curr.masteryLevel;
    if (newSteps >= 6 && mastery === 'beginner') {
      mastery = 'learner';
    }

    const updatedTechs = {
      ...data.techniqueProgress,
      [tech]: {
        ...curr,
        completedSteps: newSteps,
        masteryLevel: mastery,
      },
    };
    await StorageService.saveTechniqueProgress(updatedTechs);
    setData((prev) => ({ ...prev, techniqueProgress: updatedTechs }));
  };

  const recordPracticeAttempt = async (attempt: PracticeAttempt) => {
    const { history: newHistory, updatedTechnique } = await StorageService.recordPractice(attempt);
    setData((prev) => ({
      ...prev,
      practiceHistory: newHistory,
      techniqueProgress: {
        ...prev.techniqueProgress,
        [attempt.techniqueId]: updatedTechnique,
      },
    }));
  };

  const saveRetentionMemory = async (memory: ActiveRetentionMemory) => {
    const existingIdx = (data.retentionMemories || []).findIndex((m) => m.id === memory.id);
    let updated: ActiveRetentionMemory[];
    if (existingIdx >= 0) {
      updated = [...data.retentionMemories];
      updated[existingIdx] = memory;
    } else {
      updated = [memory, ...(data.retentionMemories || [])];
    }
    await StorageService.saveRetentionMemories(updated);
    setData((prev) => ({ ...prev, retentionMemories: updated }));
  };

  const recordRetentionReview = async (memoryId: string, score: number, total: number) => {
    const memory = (data.retentionMemories || []).find((m) => m.id === memoryId);
    if (!memory) return;

    const currentInterval = memory.currentIntervalDay;
    const intervalMap: Record<number, number> = { 1: 3, 3: 7, 7: 14, 14: 30 };
    const nextInterval = intervalMap[currentInterval] || 30;
    const isGraduated = currentInterval >= 30;

    const nextDate = new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000).toISOString();
    const newReview = {
      reviewDate: new Date().toISOString(),
      intervalDay: currentInterval,
      score,
      total,
    };

    const updatedMemory: ActiveRetentionMemory = {
      ...memory,
      reviews: [...memory.reviews, newReview],
      currentIntervalDay: nextInterval,
      nextReviewDate: nextDate,
      status: isGraduated ? 'graduated' : 'active',
    };

    await saveRetentionMemory(updatedMemory);
  };

  const activeRetentionMemory = (data.retentionMemories || []).find((m) => m.status === 'active') || data.retentionMemories?.[0];

  const resetAllData = async () => {
    const fresh = await StorageService.resetAll();
    setData(fresh);
    setHistory([]);
    setCurrentScreen('onboarding');
    setActiveTab('home');
  };

  return (
    <NavigationContext.Provider
      value={{
        currentScreen,
        activeTab,
        params,
        navigate,
        switchTab,
        goBack,
        canGoBack: history.length > 0,
        isLoading,
        profile: data.profile,
        techniqueProgress: data.techniqueProgress,
        palaces: data.palaces,
        practiceHistory: data.practiceHistory,
        retentionMemories: data.retentionMemories || [],
        activeRetentionMemory,
        updateProfile,
        updatePalaces,
        updateTechniqueStep,
        recordPracticeAttempt,
        saveRetentionMemory,
        recordRetentionReview,
        resetAllData,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

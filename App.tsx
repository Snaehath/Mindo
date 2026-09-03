import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { NavigationProvider, useNavigation } from './src/navigation/NavigationContext';
import { BottomNav } from './src/navigation/BottomNav';
import { colors } from './src/theme';

// Screens
import { OnboardingScreen } from './src/screens/onboarding/OnboardingScreen';
import { HomeScreen } from './src/screens/home/HomeScreen';
import { LearnScreen } from './src/screens/learn/LearnScreen';
import { TechniqueLessonScreen } from './src/screens/learn/TechniqueLessonScreen';
import { PalaceBuilderScreen } from './src/screens/learn/PalaceBuilderScreen';
import { PracticeScreen } from './src/screens/practice/PracticeScreen';
import { PracticeSessionScreen } from './src/screens/practice/PracticeSessionScreen';
import { ProgressScreen } from './src/screens/progress/ProgressScreen';

const RootContent: React.FC = () => {
  const { currentScreen, activeTab, switchTab, isLoading } = useNavigation();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.palace} />
      </View>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <OnboardingScreen />;
      case 'home':
        return <HomeScreen />;
      case 'learn':
        return <LearnScreen />;
      case 'techniqueDetail':
        return <TechniqueLessonScreen />;
      case 'palaceBuilder':
        return <PalaceBuilderScreen />;
      case 'practice':
        return <PracticeScreen />;
      case 'practiceSession':
        return <PracticeSessionScreen />;
      case 'progress':
        return <ProgressScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const showBottomNav = ['home', 'learn', 'practice', 'progress'].includes(currentScreen);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.content}>{renderScreen()}</View>
      {showBottomNav && <BottomNav activeTab={activeTab} onSelectTab={switchTab} />}
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationProvider>
        <RootContent />
      </NavigationProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, typography, spacing, radius } from '../../theme';
import { baselineTestWords } from '../../data/practiceData';

export const OnboardingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { updateProfile, navigate } = useNavigation();

  // 1: Welcome (combined) | 2: Baseline Test | 3: Baseline Result
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 2 state (Baseline Test)
  const [testPhase, setTestPhase] = useState<'memorize' | 'test'>('memorize');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [baselineResult, setBaselineResult] = useState<{ recalled: number; total: number }>({
    recalled: 0,
    total: 8,
  });

  // Candidate options for test recall (8 targets + 6 distractors)
  const allOptions = [
    { word: 'Candle', emoji: '🕯️' },
    { word: 'Diamond', emoji: '💎' },
    { word: 'Mirror', emoji: '🪞' },
    { word: 'Key', emoji: '🔑' },
    { word: 'Elephant', emoji: '🐘' },
    { word: 'Apple', emoji: '🍎' },
    { word: 'Guitar', emoji: '🎸' },
    { word: 'Pineapple', emoji: '🍍' },
    { word: 'Rocket', emoji: '🚀' },
    { word: 'Banana', emoji: '🍌' },
    { word: 'Shoe', emoji: '👟' },
    { word: 'Watch', emoji: '⌚' },
    { word: 'Book', emoji: '📖' },
    { word: 'Coffee', emoji: '☕' },
  ];

  const handleToggleWord = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else {
      if (selectedWords.length < 8) {
        setSelectedWords([...selectedWords, word]);
      }
    }
  };

  const handleFinishTest = () => {
    const targets = baselineTestWords.map((w) => w.word);
    const correctCount = selectedWords.filter((w) => targets.includes(w)).length;
    setBaselineResult({ recalled: correctCount, total: 8 });
    setCurrentStep(3);
  };

  const handleFinishOnboarding = async () => {
    await updateProfile({
      hasCompletedOnboarding: true,
      baselineScore: {
        total: baselineResult.total,
        recalled: baselineResult.recalled,
        date: new Date().toISOString(),
      },
    });
    navigate('techniqueDetail', { techniqueId: 'palace' });
  };

  return (
    <ScreenContainer
      scrollable
      contentContainerStyle={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 24) + 20 },
      ]}
    >
      {/* Screen 1: Combined Fast Welcome */}
      {currentStep === 1 && (
        <View style={styles.stepContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="brain" size={44} color={colors.palace} />
          </View>
          <Text style={styles.title}>Train your memory</Text>
          <Text style={styles.punchyTagline}>
            Learn simple techniques.{'\n'}
            Practice them.{'\n'}
            Remember more.
          </Text>

          <Card variant="tinted" tintColor={colors.palaceLight} style={styles.fastIntroCard}>
            <View style={styles.routineRow}>
              <Text style={styles.routineDot}>•</Text>
              <Text style={styles.routineText}>No boring theory or lectures</Text>
            </View>
            <View style={styles.routineRow}>
              <Text style={styles.routineDot}>•</Text>
              <Text style={styles.routineText}>Interactive drills for real recall</Text>
            </View>
            <View style={styles.routineRow}>
              <Text style={styles.routineDot}>•</Text>
              <Text style={styles.routineText}>100% offline, private & focused</Text>
            </View>
          </Card>

          <View style={styles.footer}>
            <Button
              label="Get Started →"
              onPress={() => setCurrentStep(2)}
              variant="palace"
            />
          </View>
        </View>
      )}

      {/* Screen 2: Tiny Baseline Test */}
      {currentStep === 2 && (
        <View style={styles.stepContainer}>
          {testPhase === 'memorize' ? (
            <>
              <Text style={styles.stepIndicator}>BASELINE TEST</Text>
              <Text style={styles.title}>Let's see how you remember naturally</Text>
              <Text style={styles.description}>
                Take 15 seconds to look at these 8 items. No tricks yet — just your raw memory.
              </Text>

              <View style={styles.wordGrid}>
                {baselineTestWords.map((item, idx) => (
                  <View key={item.id} style={styles.wordTile}>
                    <Text style={styles.wordEmoji}>{item.emoji}</Text>
                    <Text style={styles.wordText}>{item.word}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.footer}>
                <Button
                  label="Recall now →"
                  onPress={() => setTestPhase('test')}
                  variant="palace"
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.stepIndicator}>BASELINE TEST</Text>
              <Text style={styles.title}>What do you remember?</Text>
              <Text style={styles.description}>
                Tap the items you remember ({selectedWords.length}/8 selected).
              </Text>

              <View style={styles.optionsGrid}>
                {allOptions.map((opt) => {
                  const isSelected = selectedWords.includes(opt.word);
                  return (
                    <TouchableOpacity
                      key={opt.word}
                      onPress={() => handleToggleWord(opt.word)}
                      activeOpacity={0.7}
                      style={[styles.optionChip, isSelected && styles.optionChipSelected]}
                    >
                      <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {opt.word}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.footer}>
                <Button
                  label="See your result →"
                  onPress={handleFinishTest}
                  disabled={selectedWords.length === 0}
                  variant="primary"
                />
              </View>
            </>
          )}
        </View>
      )}

      {/* Screen 3: Baseline Result & Kickoff */}
      {currentStep === 3 && (
        <View style={styles.stepContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.baselineScoreText}>
              {baselineResult.recalled}/{baselineResult.total}
            </Text>
          </View>

          <Text style={styles.title}>That's your starting point</Text>
          <Text style={styles.description}>
            You recalled {baselineResult.recalled} of 8 items without techniques.
          </Text>

          <Card variant="tinted" tintColor={colors.surfaceMuted} style={styles.trainingEffectCard}>
            <Text style={styles.trainingEffectHeader}>The Training Effect</Text>
            <Text style={styles.trainingEffectBody}>
              Your brain already remembers places remarkably well.
            </Text>
            <Text style={[styles.trainingEffectBody, { marginTop: spacing.s }]}>
              A Memory Palace lets you use familiar places as anchors for new information.
            </Text>
            <Text style={[styles.trainingEffectBody, { marginTop: spacing.s, fontWeight: '600', color: colors.textPrimary }]}>
              Let's see what you can do with it.
            </Text>
          </Card>

          <View style={styles.footer}>
            <Button
              label="Start Memory Palace →"
              onPress={handleFinishOnboarding}
              variant="palace"
            />
          </View>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  stepIndicator: {
    ...typography.caption,
    color: colors.palace,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.s,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.palaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.m,
  },
  baselineScoreText: {
    ...typography.headingXL,
    color: colors.palace,
    fontWeight: '800',
  },
  title: {
    ...typography.headingXL,
    textAlign: 'center',
    marginBottom: spacing.s,
    paddingHorizontal: spacing.s,
  },
  punchyTagline: {
    ...typography.headingM,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: spacing.xl,
  },
  description: {
    ...typography.bodyL,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.m,
  },
  fastIntroCard: {
    width: '100%',
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.xxl,
    gap: spacing.m,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineDot: {
    fontSize: 20,
    color: colors.palace,
    marginRight: spacing.m,
    fontWeight: '700',
  },
  routineText: {
    ...typography.bodyL,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    width: '100%',
  },
  wordTile: {
    width: '46%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.l,
    paddingVertical: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  wordText: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.textPrimary,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    width: '100%',
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.l,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    minWidth: '45%',
  },
  optionChipSelected: {
    backgroundColor: colors.palaceLight,
    borderColor: colors.palace,
  },
  optionEmoji: {
    fontSize: 20,
    marginRight: spacing.s,
  },
  optionText: {
    ...typography.bodyM,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionTextSelected: {
    color: colors.palace,
  },
  trainingEffectCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    width: '100%',
    marginBottom: spacing.xl,
  },
  trainingEffectHeader: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.palace,
    marginBottom: spacing.s,
  },
  trainingEffectBody: {
    ...typography.bodyM,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    width: '100%',
    marginTop: spacing.s,
  },
});

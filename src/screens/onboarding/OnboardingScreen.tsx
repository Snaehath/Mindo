import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { StepBar } from '../../components/ProgressBar';
import { colors, typography, spacing, radius } from '../../theme';
import { baselineTestWords } from '../../data/practiceData';

export const OnboardingScreen: React.FC = () => {
  const { updateProfile, navigate } = useNavigation();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 3 state (Baseline Test)
  const [testPhase, setTestPhase] = useState<'memorize' | 'test' | 'done'>('memorize');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [baselineResult, setBaselineResult] = useState<{ recalled: number; total: number }>({
    recalled: 0,
    total: 5,
  });

  // Candidate options for test recall (5 target + 5 distractors)
  const allOptions = [
    { word: 'Candle', emoji: '🕯️', isTarget: true },
    { word: 'Mirror', emoji: '🪞', isTarget: true },
    { word: 'Banana', emoji: '🍌', isTarget: false },
    { word: 'Key', emoji: '🔑', isTarget: true },
    { word: 'Guitar', emoji: '🎸', isTarget: false },
    { word: 'Apple', emoji: '🍎', isTarget: true },
    { word: 'Rocket', emoji: '🚀', isTarget: false },
    { word: 'Book', emoji: '📖', isTarget: true },
    { word: 'Shoe', emoji: '👟', isTarget: false },
    { word: 'Watch', emoji: '⌚', isTarget: false },
  ];

  const handleToggleWord = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else {
      if (selectedWords.length < 5) {
        setSelectedWords([...selectedWords, word]);
      }
    }
  };

  const handleFinishTest = () => {
    const targets = baselineTestWords.map((w) => w.word);
    const correctCount = selectedWords.filter((w) => targets.includes(w)).length;
    setBaselineResult({ recalled: correctCount, total: 5 });
    setTestPhase('done');
    setCurrentStep(4);
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
    // Open Memory Palace technique lesson
    navigate('techniqueDetail', { techniqueId: 'palace' });
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Top Step Indicator */}
      <View style={styles.topBar}>
        <StepBar currentStep={currentStep} totalSteps={4} color={colors.palace} />
      </View>

      {/* Screen 1: Welcome */}
      {currentStep === 1 && (
        <View style={styles.stepContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="brain" size={48} color={colors.palace} />
          </View>
          <Text style={styles.title}>Welcome to Memory Training</Text>
          <Text style={styles.description}>
            Learn simple, proven techniques that turn your everyday brain into a reliable memory palace.
          </Text>

          <Card variant="tinted" tintColor={colors.palaceLight} style={styles.quoteCard}>
            <Text style={styles.quoteText}>
              "Memory is not an innate gift — it is a learnable physical skill."
            </Text>
          </Card>

          <View style={styles.footer}>
            <Button
              label="Get Started"
              onPress={() => setCurrentStep(2)}
              iconName="arrow-right"
              iconRight
            />
          </View>
        </View>
      )}

      {/* Screen 2: How It Works */}
      {currentStep === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>How it works</Text>
          <Text style={styles.description}>
            A simple 3-part gym routine designed for real skill acquisition.
          </Text>

          <View style={styles.flowList}>
            <Card style={styles.flowCard}>
              <View style={styles.flowRow}>
                <View style={[styles.stepNum, { backgroundColor: colors.palaceLight }]}>
                  <Text style={[styles.stepNumText, { color: colors.palace }]}>1</Text>
                </View>
                <View style={styles.flowTextContainer}>
                  <Text style={styles.flowTitle}>Learn</Text>
                  <Text style={styles.flowSubtitle}>Understand the core mental mechanism in seconds.</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.flowCard}>
              <View style={styles.flowRow}>
                <View style={[styles.stepNum, { backgroundColor: colors.linkingLight }]}>
                  <Text style={[styles.stepNumText, { color: colors.linking }]}>2</Text>
                </View>
                <View style={styles.flowTextContainer}>
                  <Text style={styles.flowTitle}>Practice</Text>
                  <Text style={styles.flowSubtitle}>Imprint items using vivid, bizarre associations.</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.flowCard}>
              <View style={styles.flowRow}>
                <View style={[styles.stepNum, { backgroundColor: colors.pegLight }]}>
                  <Text style={[styles.stepNumText, { color: colors.peg }]}>3</Text>
                </View>
                <View style={styles.flowTextContainer}>
                  <Text style={styles.flowTitle}>Recall</Text>
                  <Text style={styles.flowSubtitle}>Retrieve items effortlessly and see measurable growth.</Text>
                </View>
              </View>
            </Card>
          </View>

          <View style={styles.footer}>
            <Button
              label="Test Your Baseline →"
              onPress={() => setCurrentStep(3)}
            />
          </View>
        </View>
      )}

      {/* Screen 3: Baseline Memory Challenge */}
      {currentStep === 3 && (
        <View style={styles.stepContainer}>
          {testPhase === 'memorize' ? (
            <>
              <Text style={styles.title}>Your Baseline Challenge</Text>
              <Text style={styles.description}>
                Remember these 5 words using your natural memory. No tricks yet.
              </Text>

              <View style={styles.wordListContainer}>
                {baselineTestWords.map((item, idx) => (
                  <Card key={item.id} style={styles.wordItemCard}>
                    <Text style={styles.wordIndex}>#{idx + 1}</Text>
                    <Text style={styles.wordEmoji}>{item.emoji}</Text>
                    <Text style={styles.wordText}>{item.word}</Text>
                  </Card>
                ))}
              </View>

              <View style={styles.footer}>
                <Button
                  label="I’m Ready to Recall →"
                  onPress={() => setTestPhase('test')}
                  variant="palace"
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>Which words were on the list?</Text>
              <Text style={styles.description}>
                Tap the 5 items you saw ({selectedWords.length}/5 selected).
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
                  label="Submit Baseline"
                  onPress={handleFinishTest}
                  disabled={selectedWords.length === 0}
                />
              </View>
            </>
          )}
        </View>
      )}

      {/* Screen 4: Baseline Result & Next Action */}
      {currentStep === 4 && (
        <View style={styles.stepContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.palaceLight }]}>
            <Text style={styles.baselineScoreText}>
              {baselineResult.recalled}/{baselineResult.total}
            </Text>
          </View>

          <Text style={styles.title}>Baseline Established</Text>
          <Text style={styles.description}>
            You recalled {baselineResult.recalled} of 5 items using raw repetition.
          </Text>

          <Card variant="tinted" tintColor={colors.surfaceMuted} style={styles.improvementCard}>
            <MaterialCommunityIcons name="lightning-bolt" size={28} color={colors.palace} />
            <Text style={styles.improvementTitle}>The Training Effect</Text>
            <Text style={styles.improvementSub}>
              By linking items to a Memory Palace, your capacity will jump from 3–5 items to 10, 20, or even 50 items in exact chronological order.
            </Text>
          </Card>

          <View style={styles.footer}>
            <Text style={styles.startTechniqueLabel}>First Training Module:</Text>
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
    paddingTop: spacing.m,
    paddingBottom: spacing.xxl,
  },
  topBar: {
    marginBottom: spacing.xl,
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.palaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  baselineScoreText: {
    ...typography.headingXL,
    color: colors.palace,
    fontWeight: '800',
  },
  title: {
    ...typography.headingXL,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  description: {
    ...typography.bodyL,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.m,
  },
  quoteCard: {
    width: '100%',
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.xxl,
  },
  quoteText: {
    ...typography.bodyM,
    fontStyle: 'italic',
    color: colors.palace,
    textAlign: 'center',
  },
  flowList: {
    width: '100%',
    gap: spacing.m,
    marginBottom: spacing.xxl,
  },
  flowCard: {
    padding: spacing.m,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  stepNumText: {
    fontWeight: '700',
    fontSize: 16,
  },
  flowTextContainer: {
    flex: 1,
  },
  flowTitle: {
    ...typography.headingM,
    fontSize: 16,
    marginBottom: 2,
  },
  flowSubtitle: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },
  wordListContainer: {
    width: '100%',
    gap: spacing.s,
    marginBottom: spacing.xl,
  },
  wordItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
  },
  wordIndex: {
    ...typography.caption,
    color: colors.textMuted,
    width: 30,
  },
  wordEmoji: {
    fontSize: 24,
    marginRight: spacing.m,
  },
  wordText: {
    ...typography.headingM,
    fontSize: 18,
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
    paddingHorizontal: spacing.l,
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
  improvementCard: {
    alignItems: 'center',
    padding: spacing.l,
    width: '100%',
    marginBottom: spacing.xl,
  },
  improvementTitle: {
    ...typography.headingM,
    fontSize: 16,
    marginTop: spacing.s,
    marginBottom: spacing.xs,
  },
  improvementSub: {
    ...typography.bodyM,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  startTechniqueLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  footer: {
    width: '100%',
    marginTop: spacing.l,
  },
});

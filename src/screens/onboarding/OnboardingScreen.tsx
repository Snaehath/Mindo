import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, BackHandler } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, typography, spacing, radius } from '../../theme';
import { baselineTestWords } from '../../data/practiceData';

// First Palace training data
const FIRST_PALACE_SPOTS = [
  { id: 'spot_door', order: 1, name: 'Front Door', icon: 'door' },
  { id: 'spot_sofa', order: 2, name: 'Living Room Sofa', icon: 'sofa' },
  { id: 'spot_table', order: 3, name: 'Dining Table', icon: 'silverware-fork-knife' },
  { id: 'spot_bed', order: 4, name: 'Bedroom Bed', icon: 'bed' },
];

const FIRST_PALACE_ITEMS = [
  {
    spotIndex: 0,
    spotName: 'Front Door',
    word: 'Candle',
    emoji: '🕯️',
    bizarreScene:
      'Imagine a 10-foot burning candle melting through your Front Door, hot wax flooding the hallway.',
    sensoryHint: 'Hear the wax sizzling, smell the burning wick.',
  },
  {
    spotIndex: 1,
    spotName: 'Living Room Sofa',
    word: 'Rocket',
    emoji: '🚀',
    bizarreScene:
      'Imagine a roaring space rocket crashed into your sofa, thrusters blasting smoke into the cushions.',
    sensoryHint: 'Feel the heat and see bright sparks flying.',
  },
  {
    spotIndex: 2,
    spotName: 'Dining Table',
    word: 'Guitar',
    emoji: '🎸',
    bizarreScene:
      'Imagine an electric guitar lying on the dining table, strumming heavy metal chords loudly on its own.',
    sensoryHint: 'Hear the deafening guitar solo echoing off the walls.',
  },
  {
    spotIndex: 3,
    spotName: 'Bedroom Bed',
    word: 'Banana',
    emoji: '🍌',
    bizarreScene:
      'Imagine a giant 6-foot banana tucked under your duvet, snoring loudly like an old man.',
    sensoryHint: 'See the yellow peel sticking out of the blankets.',
  },
];

const RECALL_QUESTIONS = [
  {
    spotIndex: 0,
    spotName: 'Front Door',
    correctWord: 'Candle',
    options: [
      { word: 'Candle', emoji: '🕯️' },
      { word: 'Key', emoji: '🔑' },
      { word: 'Rocket', emoji: '🚀' },
      { word: 'Apple', emoji: '🍎' },
    ],
  },
  {
    spotIndex: 1,
    spotName: 'Living Room Sofa',
    correctWord: 'Rocket',
    options: [
      { word: 'Rocket', emoji: '🚀' },
      { word: 'Banana', emoji: '🍌' },
      { word: 'Guitar', emoji: '🎸' },
      { word: 'Candle', emoji: '🕯️' },
    ],
  },
  {
    spotIndex: 2,
    spotName: 'Dining Table',
    correctWord: 'Guitar',
    options: [
      { word: 'Guitar', emoji: '🎸' },
      { word: 'Watch', emoji: '⌚' },
      { word: 'Mirror', emoji: '🪞' },
      { word: 'Candle', emoji: '🕯️' },
    ],
  },
  {
    spotIndex: 3,
    spotName: 'Bedroom Bed',
    correctWord: 'Banana',
    options: [
      { word: 'Banana', emoji: '🍌' },
      { word: 'Rocket', emoji: '🚀' },
      { word: 'Guitar', emoji: '🎸' },
      { word: 'Apple', emoji: '🍎' },
    ],
  },
];

export const OnboardingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    updateProfile,
    switchTab,
    recordPracticeAttempt,
    saveRetentionMemory,
    palaces,
  } = useNavigation();

  // Steps 1..7: Welcome -> Baseline -> Benchmark -> Palace -> Encode -> Recall -> Aha
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  // Step 2: Baseline state
  const [testPhase, setTestPhase] = useState<'memorize' | 'test'>('memorize');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [baselineResult, setBaselineResult] = useState<{ recalled: number; total: number }>({
    recalled: 0,
    total: 8,
  });

  // Step 5: Encoding stepper index
  const [encodingItemIndex, setEncodingItemIndex] = useState(0);

  // Step 6: Recall answers map (question index -> chosen word)
  const [recallAnswers, setRecallAnswers] = useState<Record<number, string>>({});
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Double-tap race condition guard
  const [isFinishing, setIsFinishing] = useState(false);

  // Hardware back press navigation on Android
  useEffect(() => {
    const onBackPress = () => {
      if (currentStep === 1) {
        return false; // Exit app
      }
      if (currentStep === 2) {
        if (testPhase === 'test') {
          setTestPhase('memorize');
          return true;
        }
        setCurrentStep(1);
        return true;
      }
      if (currentStep === 3) {
        setCurrentStep(2);
        return true;
      }
      if (currentStep === 4) {
        setCurrentStep(3);
        return true;
      }
      if (currentStep === 5) {
        if (encodingItemIndex > 0) {
          setEncodingItemIndex(encodingItemIndex - 1);
          return true;
        }
        setCurrentStep(4);
        return true;
      }
      if (currentStep === 6) {
        if (activeQuestionIdx > 0) {
          setActiveQuestionIdx(activeQuestionIdx - 1);
          return true;
        }
        setCurrentStep(5);
        return true;
      }
      if (currentStep === 7) {
        return true; // Keep on results screen
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [currentStep, testPhase, encodingItemIndex, activeQuestionIdx]);

  // Candidate options for baseline recall (8 targets + 6 distractors)
  const allBaselineOptions = [
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

  const handleToggleBaselineWord = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else if (selectedWords.length < 8) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleFinishBaseline = () => {
    const targets = baselineTestWords.map((w) => w.word);
    const correctCount = selectedWords.filter((w) => targets.includes(w)).length;
    setBaselineResult({ recalled: correctCount, total: 8 });
    setCurrentStep(3);
  };

  const handleSelectRecallAnswer = (chosenWord: string) => {
    const updated = { ...recallAnswers, [activeQuestionIdx]: chosenWord };
    setRecallAnswers(updated);

    if (activeQuestionIdx < RECALL_QUESTIONS.length - 1) {
      setActiveQuestionIdx(activeQuestionIdx + 1);
    } else {
      // Calculate actual genuine recall score
      setCurrentStep(7);
    }
  };

  // Tally authentic recall score
  const getActualPalaceRecallScore = () => {
    let correct = 0;
    RECALL_QUESTIONS.forEach((q, idx) => {
      if (recallAnswers[idx] === q.correctWord) {
        correct += 1;
      }
    });
    return correct;
  };

  const handleFinishFirstRun = async () => {
    if (isFinishing) return;
    setIsFinishing(true);

    try {
      const actualRecalled = getActualPalaceRecallScore();
      const totalItems = 4;
      const accuracy = Math.round((actualRecalled / totalItems) * 100);

      // 1. Record authentic practice attempt in history
      await recordPracticeAttempt({
        id: `attempt_initial_${Date.now()}`,
        techniqueId: 'palace',
        level: 1,
        totalItems,
        correctItems: actualRecalled,
        accuracy,
        timestamp: new Date().toISOString(),
      });

      // 2. Schedule Day 1 retention review for tomorrow
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await saveRetentionMemory({
        id: `retention_first_${Date.now()}`,
        palaceId: palaces[0]?.id || 'palace_home_default',
        palaceName: palaces[0]?.name || 'My Home Palace',
        encodedDate: new Date().toISOString(),
        items: FIRST_PALACE_ITEMS.map((item) => ({
          spotIndex: item.spotIndex,
          spotName: item.spotName,
          word: item.word,
          emoji: item.emoji,
          bizarreHint: item.sensoryHint,
        })),
        reviews: [],
        nextReviewDate: tomorrow,
        currentIntervalDay: 1,
        status: 'active',
      });

      // 3. Persist baseline permanently and advance lifecycle to FIRST_WORKOUT_COMPLETE
      await updateProfile({
        hasCompletedOnboarding: true,
        lifecycleState: 'FIRST_WORKOUT_COMPLETE',
        baselineScore: {
          total: 8,
          recalled: baselineResult.recalled,
          date: new Date().toISOString(),
        },
      });

      // 4. Reset history and navigate to Home
      switchTab('home');
    } catch (e) {
      console.warn('Error finishing first run', e);
      setIsFinishing(false);
    }
  };

  return (
    <ScreenContainer
      scrollable
      contentContainerStyle={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 24) + 20 },
      ]}
    >
      {/* Step 1: Welcome */}
      {currentStep === 1 && (
        <View style={styles.stepContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="brain" size={44} color={colors.palace} />
          </View>
          <Text style={styles.title}>Train your memory</Text>
          <Text style={styles.punchyTagline}>
            Learn practical spatial techniques.{'\n'}
            Practice them with familiar places.{'\n'}
            Remember more.
          </Text>

          <Card variant="tinted" tintColor={colors.palaceLight} style={styles.fastIntroCard}>
            <View style={styles.routineRow}>
              <Text style={styles.routineDot}>•</Text>
              <Text style={styles.routineText}>No abstract theory or lectures</Text>
            </View>
            <View style={styles.routineRow}>
              <Text style={styles.routineDot}>•</Text>
              <Text style={styles.routineText}>Active spatial drills for real recall</Text>
            </View>
            <View style={styles.routineRow}>
              <Text style={styles.routineDot}>•</Text>
              <Text style={styles.routineText}>100% offline, private & distraction-free</Text>
            </View>
          </Card>

          <View style={styles.footer}>
            <Button
              label="Start (~3 mins) →"
              onPress={() => setCurrentStep(2)}
              variant="palace"
            />
          </View>
        </View>
      )}

      {/* Step 2: Raw Baseline Test */}
      {currentStep === 2 && (
        <View style={styles.stepContainer}>
          {testPhase === 'memorize' ? (
            <>
              <Text style={styles.stepIndicator}>BASELINE TEST</Text>
              <Text style={styles.title}>Let's see where you start</Text>
              <Text style={styles.description}>
                Take 20 seconds to look at these 8 everyday items. No tricks yet — just your raw unassisted memory.
              </Text>

              <View style={styles.wordGrid}>
                {baselineTestWords.map((item) => (
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
                {allBaselineOptions.map((opt) => {
                  const isSelected = selectedWords.includes(opt.word);
                  return (
                    <TouchableOpacity
                      key={opt.word}
                      onPress={() => handleToggleBaselineWord(opt.word)}
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
                  label="See your starting point →"
                  onPress={handleFinishBaseline}
                  disabled={selectedWords.length === 0}
                  variant="palace"
                />
              </View>
            </>
          )}
        </View>
      )}

      {/* Step 3: Starting Point Benchmark */}
      {currentStep === 3 && (
        <View style={styles.stepContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.baselineScoreText}>
              {baselineResult.recalled}/{baselineResult.total}
            </Text>
          </View>

          <Text style={styles.title}>That's your starting point</Text>
          <Text style={styles.description}>
            You recalled {baselineResult.recalled} of 8 items unassisted.
          </Text>

          <Card variant="tinted" tintColor={colors.surfaceMuted} style={styles.trainingEffectCard}>
            <Text style={styles.trainingEffectHeader}>The Training Difference</Text>
            <Text style={styles.trainingEffectBody}>
              This isn't a grade. It is your raw baseline.
            </Text>
            <Text style={[styles.trainingEffectBody, { marginTop: spacing.s }]}>
              Your brain struggles to hold abstract lists, but it remembers physical places effortlessly.
            </Text>
            <Text
              style={[
                styles.trainingEffectBody,
                { marginTop: spacing.s, fontWeight: '600', color: colors.textPrimary },
              ]}
            >
              Let's build your first Memory Palace and see what happens.
            </Text>
          </Card>

          <View style={styles.footer}>
            <Button
              label="Build Your First Palace →"
              onPress={() => setCurrentStep(4)}
              variant="palace"
            />
          </View>
        </View>
      )}

      {/* Step 4: Build First Palace (Route & Mental Walk) */}
      {currentStep === 4 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepIndicator}>THE METHOD OF LOCI</Text>
          <Text style={styles.title}>Imagine walking into your home</Text>
          <Text style={styles.description}>
            A Memory Palace uses locations you know well. Walk through these 4 spots in order:
          </Text>

          <View style={styles.lociRouteList}>
            {FIRST_PALACE_SPOTS.map((spot) => (
              <View key={spot.id} style={styles.lociRow}>
                <View style={styles.lociOrderBadge}>
                  <Text style={styles.lociOrderText}>{spot.order}</Text>
                </View>
                <Text style={styles.lociSpotName}>{spot.name}</Text>
              </View>
            ))}
          </View>

          <Card variant="tinted" tintColor={colors.palaceLight} style={styles.mentalTipCard}>
            <View style={styles.mentalTipHeaderRow}>
              <MaterialCommunityIcons name="eye-off-outline" size={24} color={colors.palace} />
              <Text style={styles.mentalTipTitle}>Mental Mode</Text>
            </View>
            <Text style={styles.mentalTipBody}>
              Put your phone down for 10 seconds. Close your eyes and mentally walk from your Front Door to the Bed.
            </Text>
          </Card>

          <View style={styles.footer}>
            <Button
              label="I've walked through →"
              onPress={() => setCurrentStep(5)}
              variant="palace"
            />
          </View>
        </View>
      )}

      {/* Step 5: Bizarre Association Encoding */}
      {currentStep === 5 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepIndicator}>
            ENCODING ITEM {encodingItemIndex + 1} OF {FIRST_PALACE_ITEMS.length}
          </Text>

          {/* Current Association Card */}
          <Card style={styles.associationCard}>
            <Text style={styles.associationSpotTag}>
              SPOT {FIRST_PALACE_ITEMS[encodingItemIndex].spotIndex + 1} ·{' '}
              {FIRST_PALACE_ITEMS[encodingItemIndex].spotName.toUpperCase()}
            </Text>
            <Text style={styles.associationEmoji}>
              {FIRST_PALACE_ITEMS[encodingItemIndex].emoji}
            </Text>
            <Text style={styles.associationWord}>
              {FIRST_PALACE_ITEMS[encodingItemIndex].word}
            </Text>

            <View style={styles.bizarreSceneBox}>
              <Text style={styles.bizarreSceneText}>
                {FIRST_PALACE_ITEMS[encodingItemIndex].bizarreScene}
              </Text>
              <Text style={styles.bizarreSensoryHint}>
                💡 {FIRST_PALACE_ITEMS[encodingItemIndex].sensoryHint}
              </Text>
            </View>
          </Card>

          <View style={styles.navRow}>
            {encodingItemIndex > 0 && (
              <Button
                label="← Prev"
                onPress={() => setEncodingItemIndex(encodingItemIndex - 1)}
                variant="outline"
                size="normal"
                style={{ width: 100 }}
              />
            )}
            <Button
              label={
                encodingItemIndex === FIRST_PALACE_ITEMS.length - 1
                  ? 'Ready to test recall →'
                  : 'Next item →'
              }
              onPress={() => {
                if (encodingItemIndex < FIRST_PALACE_ITEMS.length - 1) {
                  setEncodingItemIndex(encodingItemIndex + 1);
                } else {
                  setCurrentStep(6);
                }
              }}
              variant="palace"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}

      {/* Step 6: Immediate Active Recall */}
      {currentStep === 6 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepIndicator}>
            RECALL TEST · SPOT {activeQuestionIdx + 1} OF {RECALL_QUESTIONS.length}
          </Text>

          <Card style={styles.questionCard}>
            <Text style={styles.questionSpotTag}>
              SPOT {activeQuestionIdx + 1} · {RECALL_QUESTIONS[activeQuestionIdx].spotName.toUpperCase()}
            </Text>
            <Text style={styles.questionTitle}>What was at this spot?</Text>
            <Text style={styles.questionSub}>
              Walk through your home in your mind. What bizarre thing happened here?
            </Text>
          </Card>

          <View style={styles.recallChoicesGrid}>
            {RECALL_QUESTIONS[activeQuestionIdx].options.map((opt) => (
              <TouchableOpacity
                key={opt.word}
                onPress={() => handleSelectRecallAnswer(opt.word)}
                activeOpacity={0.7}
                style={styles.recallChoiceTile}
              >
                <Text style={styles.recallChoiceEmoji}>{opt.emoji}</Text>
                <Text style={styles.recallChoiceWord}>{opt.word}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Step 7: The "Aha" Moment & Enrollment */}
      {currentStep === 7 && (
        <View style={styles.stepContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.baselineScoreText}>
              {getActualPalaceRecallScore()}/4
            </Text>
          </View>

          <Text style={styles.title}>
            {getActualPalaceRecallScore() === 4
              ? 'You recalled all 4 items! 🎉'
              : `You recalled ${getActualPalaceRecallScore()} of 4 items! 🧠`}
          </Text>
          <Text style={styles.description}>
            That is the power of the Memory Palace.
          </Text>

          {/* The Aha Comparison */}
          <Card variant="tinted" tintColor={colors.palaceLight} style={styles.ahaCard}>
            <Text style={styles.ahaHeader}>The "Aha" Difference</Text>
            <Text style={styles.ahaBody}>
              In the baseline test, you tried to hold an abstract list in your head.
            </Text>
            <Text style={[styles.ahaBody, { marginTop: spacing.s }]}>
              Here, you didn't memorize words. You simply walked through your home and found each item right where you left it.
            </Text>
          </Card>

          {/* Retention Promise */}
          <Card variant="tinted" tintColor={colors.surfaceMuted} style={styles.retentionCard}>
            <View style={styles.retentionHeaderRow}>
              <MaterialCommunityIcons name="calendar-clock" size={22} color={colors.palace} />
              <Text style={styles.retentionTitle}>Tomorrow's Check-in</Text>
            </View>
            <Text style={styles.retentionBody}>
              Remembering today is easy. Will you still remember them tomorrow?
            </Text>
            <Text style={[styles.retentionBody, { marginTop: spacing.s, fontWeight: '600', color: colors.textPrimary }]}>
              We've enrolled your palace for a 1-day retention check-in.
            </Text>
          </Card>

          <View style={styles.footer}>
            <Button
              label="Go to Your Dashboard →"
              onPress={handleFinishFirstRun}
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
    marginBottom: spacing.l,
  },
  title: {
    ...typography.headingXL,
    textAlign: 'center',
    color: colors.textPrimary,
    marginBottom: spacing.s,
  },
  punchyTagline: {
    ...typography.bodyL,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  description: {
    ...typography.bodyM,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.m,
    lineHeight: 22,
  },
  fastIntroCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    width: '100%',
    marginBottom: spacing.xl,
    gap: spacing.m,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineDot: {
    fontSize: 20,
    color: colors.palace,
    marginRight: spacing.s,
  },
  routineText: {
    ...typography.bodyM,
    color: colors.textPrimary,
    fontWeight: '500',
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
    width: '45%',
    backgroundColor: colors.surface,
    padding: spacing.l,
    borderRadius: radius.l,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
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
  baselineScoreText: {
    ...typography.headingXL,
    fontSize: 30,
    color: colors.palace,
    fontWeight: '800',
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
  lociRouteList: {
    width: '100%',
    gap: spacing.s,
    marginBottom: spacing.xl,
  },
  lociRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.l,
    borderRadius: radius.l,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  lociOrderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.palaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  lociOrderText: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.palace,
  },
  lociSpotName: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.textPrimary,
  },
  mentalTipCard: {
    padding: spacing.l,
    borderRadius: radius.l,
    width: '100%',
    marginBottom: spacing.xl,
  },
  mentalTipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    marginBottom: spacing.xs,
  },
  mentalTipTitle: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.palace,
  },
  mentalTipBody: {
    ...typography.bodyM,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  associationCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    width: '100%',
  },
  associationSpotTag: {
    ...typography.caption,
    color: colors.palace,
    fontWeight: '700',
    marginBottom: spacing.m,
  },
  associationEmoji: {
    fontSize: 64,
    marginBottom: spacing.xs,
  },
  associationWord: {
    ...typography.headingXL,
    fontSize: 26,
    color: colors.textPrimary,
    marginBottom: spacing.l,
  },
  bizarreSceneBox: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.l,
    borderRadius: radius.l,
    width: '100%',
    gap: spacing.s,
  },
  bizarreSceneText: {
    ...typography.bodyL,
    color: colors.textPrimary,
    lineHeight: 22,
    textAlign: 'center',
  },
  bizarreSensoryHint: {
    ...typography.bodyM,
    color: colors.palace,
    fontWeight: '600',
    textAlign: 'center',
  },
  navRow: {
    flexDirection: 'row',
    gap: spacing.m,
    width: '100%',
  },
  questionCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  questionSpotTag: {
    ...typography.caption,
    color: colors.palace,
    fontWeight: '700',
    marginBottom: spacing.s,
  },
  questionTitle: {
    ...typography.headingL,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  questionSub: {
    ...typography.bodyM,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  recallChoicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
    justifyContent: 'center',
    width: '100%',
  },
  recallChoiceTile: {
    width: '45%',
    backgroundColor: colors.surface,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.l,
    borderRadius: radius.l,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  recallChoiceEmoji: {
    fontSize: 36,
    marginBottom: spacing.s,
  },
  recallChoiceWord: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.textPrimary,
  },
  ahaCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    width: '100%',
    marginBottom: spacing.m,
  },
  ahaHeader: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.palace,
    marginBottom: spacing.s,
  },
  ahaBody: {
    ...typography.bodyM,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  retentionCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    width: '100%',
    marginBottom: spacing.xl,
  },
  retentionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    marginBottom: spacing.xs,
  },
  retentionTitle: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.palace,
  },
  retentionBody: {
    ...typography.bodyM,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    width: '100%',
    marginTop: spacing.s,
  },
});

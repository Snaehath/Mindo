import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { MemoryCard } from '../../components/MemoryCard';
import { StepBar, ProgressBar } from '../../components/ProgressBar';
import { colors, typography, spacing, radius } from '../../theme';
import { getPracticeItems, PracticeItem, practiceItemPool } from '../../data/practiceData';
import { pegRhymes } from '../../data/pegData';
import { TechniqueType, UserPalace } from '../../types';

export const PracticeSessionScreen: React.FC = () => {
  const { params, goBack, palaces, recordPracticeAttempt, profile, navigate } = useNavigation();

  const techniqueId: TechniqueType = params?.techniqueId || 'palace';
  const level: number = params?.level || 1;
  const itemCount: number = params?.itemCount || 5;
  const palaceId: string = params?.palaceId || palaces[0]?.id;

  const currentPalace: UserPalace | undefined = palaces.find((p) => p.id === palaceId) || palaces[0];

  // Generate target items for this session
  const items: PracticeItem[] = useMemo(() => {
    return getPracticeItems(itemCount);
  }, [itemCount]);

  // Phases: 'memorize' -> 'recall' -> 'result'
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'result'>('memorize');
  const [currentMemorizeIndex, setCurrentMemorizeIndex] = useState(0);

  // Recall answers state: map question index to user answer word
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [currentRecallQuestionIdx, setCurrentRecallQuestionIdx] = useState(0);

  // Final score result
  const [sessionScore, setSessionScore] = useState<{
    correct: number;
    total: number;
    accuracy: number;
  }>({ correct: 0, total: itemCount, accuracy: 0 });

  // Compute location/anchor for current item
  const getAnchorInfo = (idx: number) => {
    if (techniqueId === 'palace') {
      const spot = currentPalace?.spots[idx % (currentPalace?.spots?.length || 1)];
      return {
        label: `Spot #${idx + 1}: ${spot?.name || 'Room spot'}`,
        hint: `Anchor this item vividly to the ${spot?.name || 'spot'}. Make it interact aggressively!`,
      };
    } else if (techniqueId === 'peg') {
      const peg = pegRhymes[idx % pegRhymes.length];
      return {
        label: `Peg #${peg.number}: ${peg.number} = ${peg.rhymeWord} ${peg.emoji}`,
        hint: `Combine this item with a giant ${peg.rhymeWord} (${peg.prompt})!`,
      };
    } else {
      // Linking
      if (idx === 0) {
        return {
          label: 'Story Start (Item #1)',
          hint: 'Picture this first item standing in front of you.',
        };
      }
      const prevItem = items[idx - 1];
      return {
        label: `Chain #${idx + 1}: ${prevItem.word} → ${items[idx].word}`,
        hint: `Imagine ${prevItem.word} colliding wildly with ${items[idx].word}!`,
      };
    }
  };

  const currentItem = items[currentMemorizeIndex];
  const anchor = getAnchorInfo(currentMemorizeIndex);

  const handleNextMemorize = () => {
    if (currentMemorizeIndex < items.length - 1) {
      setCurrentMemorizeIndex(currentMemorizeIndex + 1);
    } else {
      // Transition to recall
      setPhase('recall');
      setCurrentRecallQuestionIdx(0);
    }
  };

  const handlePrevMemorize = () => {
    if (currentMemorizeIndex > 0) {
      setCurrentMemorizeIndex(currentMemorizeIndex - 1);
    }
  };

  // Generate 4 multiple-choice options for the active recall question
  const currentRecallOptions = useMemo(() => {
    if (phase !== 'recall') return [];
    const targetItem = items[currentRecallQuestionIdx];
    if (!targetItem) return [];

    const distractors = practiceItemPool
      .filter((p) => p.word !== targetItem.word)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const options = [targetItem, ...distractors].sort(() => 0.5 - Math.random());
    return options;
  }, [phase, currentRecallQuestionIdx, items]);

  const handleAnswerQuestion = (selectedWord: string) => {
    const updatedAnswers = {
      ...userAnswers,
      [currentRecallQuestionIdx]: selectedWord,
    };
    setUserAnswers(updatedAnswers);

    if (currentRecallQuestionIdx < items.length - 1) {
      setCurrentRecallQuestionIdx(currentRecallQuestionIdx + 1);
    } else {
      // Finish session and compute score
      let correctCount = 0;
      items.forEach((it, idx) => {
        if (updatedAnswers[idx] === it.word) {
          correctCount += 1;
        }
      });

      const accuracy = Math.round((correctCount / items.length) * 100);
      setSessionScore({
        correct: correctCount,
        total: items.length,
        accuracy,
      });

      // Record offline in storage
      recordPracticeAttempt({
        id: `attempt_${Date.now()}`,
        techniqueId,
        level,
        totalItems: items.length,
        correctItems: correctCount,
        accuracy,
        timestamp: new Date().toISOString(),
      });

      setPhase('result');
    }
  };

  const getEncouragement = (correct: number, total: number) => {
    const ratio = correct / total;
    if (ratio === 1) return 'Perfection! Your mental anchors held with 100% precision. 🏆';
    if (ratio >= 0.8) return 'Outstanding recall! Your associations were remarkably strong. 🌟';
    if (ratio >= 0.6) return 'Good effort! Make the mental imagery louder, bigger, and weirder next time. 💪';
    return 'Good workout! Exaggerate the images more — bizarre scenes stick best. 🧠';
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <Header
        title={
          phase === 'memorize'
            ? 'Memorization Phase'
            : phase === 'recall'
            ? 'Recall Challenge'
            : 'Workout Results'
        }
        subtitle={
          phase === 'memorize'
            ? `Card ${currentMemorizeIndex + 1} of ${items.length}`
            : phase === 'recall'
            ? `Item #${currentRecallQuestionIdx + 1} of ${items.length}`
            : `Level ${level} Complete`
        }
        onBack={phase === 'result' ? undefined : goBack}
      />

      {/* PHASE 1: MEMORIZATION */}
      {phase === 'memorize' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          <View style={styles.topProgress}>
            <StepBar
              currentStep={currentMemorizeIndex + 1}
              totalSteps={items.length}
              color={
                techniqueId === 'palace'
                  ? colors.palace
                  : techniqueId === 'linking'
                  ? colors.linking
                  : colors.peg
              }
            />
          </View>

          <MemoryCard
            emoji={currentItem.emoji}
            title={currentItem.word}
            locationOrPeg={anchor.label}
            associationHint={anchor.hint}
            style={styles.cardSpacing}
          />

          <View style={styles.navButtonsRow}>
            <Button
              label="← Prev"
              onPress={handlePrevMemorize}
              disabled={currentMemorizeIndex === 0}
              variant="outline"
              size="normal"
              style={styles.halfBtn}
            />
            <Button
              label={currentMemorizeIndex === items.length - 1 ? 'Start Recall Test →' : 'Next Card →'}
              onPress={handleNextMemorize}
              variant={
                techniqueId === 'palace'
                  ? 'palace'
                  : techniqueId === 'linking'
                  ? 'linking'
                  : 'peg'
              }
              size="normal"
              style={styles.halfBtn}
            />
          </View>
        </ScrollView>
      )}

      {/* PHASE 2: RECALL */}
      {phase === 'recall' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          <View style={styles.topProgress}>
            <StepBar
              currentStep={currentRecallQuestionIdx + 1}
              totalSteps={items.length}
              color={colors.primary}
            />
          </View>

          <Card style={styles.questionCard}>
            <Text style={styles.recallPromptLabel}>Recall Question:</Text>
            <Text style={styles.recallQuestionText}>
              {techniqueId === 'palace'
                ? `What was at ${getAnchorInfo(currentRecallQuestionIdx).label}?`
                : techniqueId === 'peg'
                ? `What item was hanging on Peg #${currentRecallQuestionIdx + 1}?`
                : `What item followed in the story chain at position #${currentRecallQuestionIdx + 1}?`}
            </Text>
          </Card>

          <Text style={styles.selectPrompt}>Tap the matching item:</Text>

          <View style={styles.recallOptionsGrid}>
            {currentRecallOptions.map((opt) => (
              <TouchableOpacity
                key={opt.word}
                onPress={() => handleAnswerQuestion(opt.word)}
                activeOpacity={0.7}
                style={styles.recallOptionBtn}
              >
                <Text style={styles.recallOptionEmoji}>{opt.emoji}</Text>
                <Text style={styles.recallOptionText}>{opt.word}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* PHASE 3: RESULTS */}
      {phase === 'result' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          <View style={styles.resultScoreCircle}>
            <Text style={styles.resultScoreText}>
              {sessionScore.correct}/{sessionScore.total}
            </Text>
            <Text style={styles.resultAccuracyText}>{sessionScore.accuracy}% Accuracy</Text>
          </View>

          <Text style={styles.resultHeading}>
            {sessionScore.correct === sessionScore.total ? 'Flawless Recall! 🎉' : 'Workout Complete! 🧠'}
          </Text>

          <Card variant="tinted" tintColor={colors.surfaceMuted} style={styles.feedbackCard}>
            <Text style={styles.feedbackText}>
              {getEncouragement(sessionScore.correct, sessionScore.total)}
            </Text>
          </Card>

          {/* Baseline Improvement Comparison */}
          {profile.baselineScore && (
            <Card variant="tinted" tintColor={colors.successLight} style={styles.baselineCard}>
              <View style={styles.baselineHeaderRow}>
                <MaterialCommunityIcons name="trending-up" size={24} color={colors.success} />
                <Text style={styles.baselineTitle}>Improvement vs Baseline</Text>
              </View>
              <Text style={styles.baselineComparisonText}>
                Before technique training: {profile.baselineScore.recalled} / {profile.baselineScore.total} items.
              </Text>
              <Text style={styles.baselineImprovementHighlight}>
                Today's recall: {sessionScore.correct} items! (+
                {Math.max(0, sessionScore.correct - profile.baselineScore.recalled)} items gain)
              </Text>
            </Card>
          )}

          {/* Breakdown Table */}
          <View style={styles.breakdownBox}>
            <Text style={styles.breakdownTitle}>Item Breakdown:</Text>
            {items.map((it, idx) => {
              const isCorrect = userAnswers[idx] === it.word;
              return (
                <View key={it.word} style={styles.breakdownRow}>
                  <Text style={styles.breakdownOrder}>#{idx + 1}</Text>
                  <Text style={styles.breakdownEmoji}>{it.emoji}</Text>
                  <Text style={styles.breakdownName}>{it.word}</Text>
                  <MaterialCommunityIcons
                    name={isCorrect ? 'check-circle' : 'close-circle'}
                    size={20}
                    color={isCorrect ? colors.success : colors.danger}
                  />
                </View>
              );
            })}
          </View>

          <View style={styles.resultActions}>
            <Button
              label="Try Again"
              onPress={() => {
                setPhase('memorize');
                setCurrentMemorizeIndex(0);
                setUserAnswers({});
                setCurrentRecallQuestionIdx(0);
              }}
              variant="outline"
              style={styles.halfBtn}
            />
            <Button
              label="Back to Gym"
              onPress={() => goBack()}
              variant="primary"
              style={styles.halfBtn}
            />
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
  },
  scrollBody: {
    paddingHorizontal: spacing.l,
    paddingBottom: 40,
  },
  topProgress: {
    marginBottom: spacing.l,
  },
  cardSpacing: {
    marginBottom: spacing.xl,
  },
  navButtonsRow: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  halfBtn: {
    flex: 1,
  },
  questionCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  recallPromptLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.s,
  },
  recallQuestionText: {
    ...typography.headingM,
    color: colors.textPrimary,
    lineHeight: 26,
  },
  selectPrompt: {
    ...typography.bodyM,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.m,
  },
  recallOptionsGrid: {
    gap: spacing.m,
  },
  recallOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.l,
    borderRadius: radius.l,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  recallOptionEmoji: {
    fontSize: 28,
    marginRight: spacing.m,
  },
  recallOptionText: {
    ...typography.headingM,
    fontSize: 17,
    color: colors.textPrimary,
  },
  resultScoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.palaceLight,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
    marginTop: spacing.s,
  },
  resultScoreText: {
    ...typography.headingXL,
    fontSize: 36,
    color: colors.palace,
    fontWeight: '800',
  },
  resultAccuracyText: {
    ...typography.bodyS,
    color: colors.palace,
    fontWeight: '700',
    marginTop: 2,
  },
  resultHeading: {
    ...typography.headingL,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  feedbackCard: {
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.l,
  },
  feedbackText: {
    ...typography.bodyM,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  baselineCard: {
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.l,
  },
  baselineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    marginBottom: spacing.xs,
  },
  baselineTitle: {
    ...typography.headingM,
    fontSize: 15,
    color: colors.success,
  },
  baselineComparisonText: {
    ...typography.bodyS,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  baselineImprovementHighlight: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.success,
  },
  breakdownBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.xl,
  },
  breakdownTitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.s,
    paddingHorizontal: spacing.s,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  breakdownOrder: {
    ...typography.caption,
    color: colors.textMuted,
    width: 28,
  },
  breakdownEmoji: {
    fontSize: 20,
    marginRight: spacing.s,
  },
  breakdownName: {
    flex: 1,
    ...typography.bodyM,
    color: colors.textPrimary,
  },
  resultActions: {
    flexDirection: 'row',
    gap: spacing.m,
  },
});

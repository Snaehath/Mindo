import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, typography, spacing, radius } from '../../theme';
import { ActiveRetentionMemory } from '../../types';
import { practiceItemPool } from '../../data/practiceData';

export const DelayedRecallScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { params, goBack, recordRetentionReview, activeRetentionMemory, retentionMemories } = useNavigation();

  // Find target memory
  const memoryId: string = params?.memoryId || activeRetentionMemory?.id || '';
  const memory: ActiveRetentionMemory | undefined =
    retentionMemories.find((m) => m.id === memoryId) || activeRetentionMemory;

  // If no active memory found, provide a fallback structure
  const items = memory?.items || [
    { spotIndex: 0, spotName: 'Front Door', word: 'Pineapple', emoji: '🍍', bizarreHint: 'Jammed into the doorway wearing sunglasses' },
    { spotIndex: 1, spotName: 'Living Room Sofa', word: 'Guitar', emoji: '🎸', bizarreHint: 'Blasting heavy metal music on cushions' },
    { spotIndex: 2, spotName: 'Dining Table', word: 'Basketball', emoji: '🏀', bizarreHint: 'Spinning in a hot bowl of soup' },
    { spotIndex: 3, spotName: 'Bedroom Bed', word: 'Alarm Clock', emoji: '⏰', bizarreHint: 'Bouncing and ringing like an earthquake' },
  ];

  const palaceName = memory?.palaceName || 'My Home Palace';
  const intervalDay = memory?.currentIntervalDay || 1;

  // Phases: 'walk' -> 'recall' -> 'result'
  const [phase, setPhase] = useState<'walk' | 'recall' | 'result'>('walk');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [recallMode, setRecallMode] = useState<'choice' | 'type'>('choice');
  const [typedInput, setTypedInput] = useState('');

  // 4 choices for current spot
  const currentRecallOptions = useMemo(() => {
    if (phase !== 'recall') return [];
    const target = items[currentQuestionIdx];
    if (!target) return [];

    const distractors = practiceItemPool
      .filter((p) => p.word.toLowerCase() !== target.word.toLowerCase())
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    return [
      { word: target.word, emoji: target.emoji },
      ...distractors.map((d) => ({ word: d.word, emoji: d.emoji })),
    ].sort(() => 0.5 - Math.random());
  }, [phase, currentQuestionIdx, items]);

  const handleAnswer = (ans: string) => {
    const updated = { ...userAnswers, [currentQuestionIdx]: ans.trim() };
    setUserAnswers(updated);
    setTypedInput('');

    if (currentQuestionIdx < items.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      // Calculate retention score
      let correct = 0;
      items.forEach((it, idx) => {
        if ((updated[idx] || '').trim().toLowerCase() === it.word.toLowerCase()) {
          correct += 1;
        }
      });

      if (memory) {
        recordRetentionReview(memory.id, correct, items.length);
      }
      setPhase('result');
    }
  };

  const correctCount = items.filter(
    (it, idx) => (userAnswers[idx] || '').trim().toLowerCase() === it.word.toLowerCase()
  ).length;

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <Header
        title="Delayed Recall"
        subtitle={
          phase === 'walk'
            ? `Day ${intervalDay} Check-in`
            : phase === 'recall'
            ? `Spot ${currentQuestionIdx + 1} of ${items.length}`
            : 'Retention Results'
        }
        onBack={phase === 'result' ? undefined : goBack}
      />

      {/* PHASE 1: MENTAL WALK */}
      {phase === 'walk' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollBody,
            styles.centeredScroll,
            { paddingBottom: 60 + Math.max(insets.bottom, 20) },
          ]}
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="calendar-clock" size={44} color={colors.palace} />
          </View>

          <Text style={styles.walkTitle}>Put your phone down</Text>
          <Text style={styles.walkBody}>
            Close your eyes and walk through <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{palaceName}</Text> once.
          </Text>
          <Text style={[styles.walkBody, { marginTop: spacing.s }]}>
            Can you still retrieve the {items.length} items you placed here {intervalDay} day{intervalDay > 1 ? 's' : ''} ago?
          </Text>

          <Card variant="tinted" tintColor={colors.palaceLight} style={styles.mentalTipCard}>
            <Text style={styles.mentalTipText}>
              "Immediate recall measures encoding. Delayed recall proves durable memory."
            </Text>
          </Card>

          <Button
            label="Ready to recall →"
            onPress={() => {
              setPhase('recall');
              setCurrentQuestionIdx(0);
            }}
            variant="palace"
            style={{ width: '100%', marginTop: spacing.xl }}
          />
        </ScrollView>
      )}

      {/* PHASE 2: ACTIVE RETRIEVAL */}
      {phase === 'recall' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollBody,
            { paddingBottom: 60 + Math.max(insets.bottom, 20) },
          ]}
        >
          <View style={styles.topProgress}>
            <Text style={styles.recallCounter}>
              SPOT {currentQuestionIdx + 1} OF {items.length}
            </Text>
          </View>

          <Card style={styles.questionCard}>
            <Text style={styles.recallSpotTag}>
              SPOT {currentQuestionIdx + 1} · {items[currentQuestionIdx]?.spotName?.toUpperCase()}
            </Text>
            <Text style={styles.questionPrompt}>What was stored here?</Text>
          </Card>

          {/* Mode switch */}
          <View style={styles.modeSwitch}>
            <TouchableOpacity
              onPress={() => setRecallMode('choice')}
              style={[styles.modeTab, recallMode === 'choice' && styles.modeTabActive]}
            >
              <Text style={[styles.modeTabText, recallMode === 'choice' && styles.modeTabTextActive]}>
                Options
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRecallMode('type')}
              style={[styles.modeTab, recallMode === 'type' && styles.modeTabActive]}
            >
              <Text style={[styles.modeTabText, recallMode === 'type' && styles.modeTabTextActive]}>
                Type (Pro)
              </Text>
            </TouchableOpacity>
          </View>

          {recallMode === 'choice' ? (
            <View style={styles.choiceGrid}>
              {currentRecallOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.word}
                  onPress={() => handleAnswer(opt.word)}
                  activeOpacity={0.7}
                  style={styles.choiceBtn}
                >
                  <Text style={styles.choiceEmoji}>{opt.emoji}</Text>
                  <Text style={styles.choiceText}>{opt.word}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.typeBox}>
              <TextInput
                value={typedInput}
                onChangeText={setTypedInput}
                placeholder="Type item name..."
                placeholderTextColor={colors.textMuted}
                style={styles.typeInput}
                onSubmitEditing={() => handleAnswer(typedInput)}
                autoFocus
              />
              <Button
                label="Submit Item"
                onPress={() => handleAnswer(typedInput)}
                disabled={!typedInput.trim()}
                variant="palace"
                style={{ marginTop: spacing.m }}
              />
            </View>
          )}
        </ScrollView>
      )}

      {/* PHASE 3: RETENTION RESULTS */}
      {phase === 'result' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollBody,
            { paddingBottom: 60 + Math.max(insets.bottom, 20) },
          ]}
        >
          <View style={styles.resultScoreCircle}>
            <Text style={styles.resultScoreNum}>
              {correctCount}/{items.length}
            </Text>
            <Text style={styles.resultAccuracyLabel}>
              {Math.round((correctCount / items.length) * 100)}% Retained
            </Text>
          </View>

          <Text style={styles.resultTitle}>
            {correctCount >= items.length * 0.8
              ? 'Your palace is holding strong! 🧠'
              : 'Good retention workout'}
          </Text>

          {/* Genuine Coach Observation */}
          <Card variant="tinted" tintColor={colors.surfaceMuted} style={styles.coachCard}>
            <Text style={styles.coachBody}>
              {correctCount === items.length
                ? `Incredible. You recalled all ${items.length} items with 100% fidelity after ${intervalDay} day${intervalDay > 1 ? 's' : ''}.`
                : `You remembered ${correctCount} items after ${intervalDay} day${intervalDay > 1 ? 's' : ''}. Spaced review strengthens the pathways that faded.`}
            </Text>
          </Card>

          {/* Review Breakdown */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewHeading}>Items Breakdown:</Text>
            {items.map((it, idx) => {
              const userAns = (userAnswers[idx] || '').trim().toLowerCase();
              const isMatch = userAns === it.word.toLowerCase();

              return (
                <View key={it.word} style={styles.reviewRow}>
                  <Text style={styles.reviewIndex}>#{idx + 1}</Text>
                  <Text style={styles.reviewEmoji}>{it.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewSpot}>{it.spotName}</Text>
                    <Text style={styles.reviewWord}>{it.word}</Text>
                    {!isMatch && it.bizarreHint && (
                      <Text style={styles.strengthenHint}>💡 Re-anchor: {it.bizarreHint}</Text>
                    )}
                  </View>
                  <MaterialCommunityIcons
                    name={isMatch ? 'check-circle' : 'alert-circle-outline'}
                    size={22}
                    color={isMatch ? colors.success : colors.warning}
                  />
                </View>
              );
            })}
          </View>

          <Button
            label="Done → Back to Home"
            onPress={() => goBack()}
            variant="palace"
            style={{ marginTop: spacing.l }}
          />
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
  },
  centeredScroll: {
    alignItems: 'center',
    paddingTop: spacing.l,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.palaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  walkTitle: {
    ...typography.headingXL,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  walkBody: {
    ...typography.bodyL,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.m,
  },
  mentalTipCard: {
    padding: spacing.l,
    borderRadius: radius.l,
    marginTop: spacing.xl,
    width: '100%',
  },
  mentalTipText: {
    ...typography.bodyM,
    color: colors.palace,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  topProgress: {
    marginBottom: spacing.l,
  },
  recallCounter: {
    ...typography.caption,
    color: colors.palace,
    fontWeight: '700',
    letterSpacing: 1,
  },
  questionCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing.l,
  },
  recallSpotTag: {
    ...typography.caption,
    color: colors.palace,
    fontWeight: '700',
    marginBottom: spacing.s,
  },
  questionPrompt: {
    ...typography.headingL,
    fontSize: 20,
    color: colors.textPrimary,
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.m,
    padding: 3,
    marginBottom: spacing.l,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.s,
  },
  modeTabActive: {
    backgroundColor: colors.surface,
  },
  modeTabText: {
    ...typography.bodyS,
    color: colors.textMuted,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  choiceGrid: {
    gap: spacing.m,
  },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.l,
    borderRadius: radius.l,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  choiceEmoji: {
    fontSize: 24,
    marginRight: spacing.m,
  },
  choiceText: {
    ...typography.bodyL,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  typeBox: {
    width: '100%',
  },
  typeInput: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.l,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
    fontSize: 18,
    color: colors.textPrimary,
  },
  resultScoreCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.palaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: spacing.s,
    marginBottom: spacing.l,
  },
  resultScoreNum: {
    ...typography.headingXL,
    fontSize: 34,
    fontWeight: '800',
    color: colors.palace,
  },
  resultAccuracyLabel: {
    ...typography.bodyS,
    fontWeight: '700',
    color: colors.palace,
  },
  resultTitle: {
    ...typography.headingL,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  coachCard: {
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.l,
  },
  coachBody: {
    ...typography.bodyM,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  reviewSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.l,
  },
  reviewHeading: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.s,
    paddingHorizontal: spacing.s,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  reviewIndex: {
    ...typography.caption,
    color: colors.textMuted,
    width: 28,
  },
  reviewEmoji: {
    fontSize: 22,
    marginRight: spacing.s,
  },
  reviewSpot: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  reviewWord: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  strengthenHint: {
    ...typography.caption,
    color: colors.warning,
    marginTop: 2,
    lineHeight: 16,
  },
});

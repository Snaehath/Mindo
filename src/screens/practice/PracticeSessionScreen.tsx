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
import { getPracticeItems, PracticeItem, practiceItemPool } from '../../data/practiceData';
import { pegRhymes } from '../../data/pegData';
import { TechniqueType, UserPalace } from '../../types';

export const PracticeSessionScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { params, goBack, palaces, recordPracticeAttempt, profile } = useNavigation();

  const techniqueId: TechniqueType = params?.techniqueId || 'palace';
  const level: number = params?.level || 1;
  const itemCount: number = params?.itemCount || 5;
  const palaceId: string = params?.palaceId || palaces[0]?.id;

  const currentPalace: UserPalace | undefined = palaces.find((p) => p.id === palaceId) || palaces[0];

  const items: PracticeItem[] = useMemo(() => {
    return getPracticeItems(itemCount);
  }, [itemCount]);

  // Phases: 'memorize' -> 'mental_walk' -> 'recall' -> 'result'
  const [phase, setPhase] = useState<'memorize' | 'mental_walk' | 'recall' | 'result'>('memorize');
  const [currentMemorizeIndex, setCurrentMemorizeIndex] = useState(0);

  // Recall answers state: map question index to user answer word
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [currentRecallQuestionIdx, setCurrentRecallQuestionIdx] = useState(0);
  const [recallMode, setRecallMode] = useState<'type' | 'choice'>('choice');
  const [typedInput, setTypedInput] = useState('');

  // Final score result
  const [sessionScore, setSessionScore] = useState<{
    correct: number;
    total: number;
    accuracy: number;
  }>({ correct: 0, total: itemCount, accuracy: 0 });

  const getAnchorInfo = (idx: number) => {
    if (techniqueId === 'palace') {
      const spot = currentPalace?.spots[idx % (currentPalace?.spots?.length || 1)];
      return {
        spotTag: `SPOT ${idx + 1} · ${spot?.name?.toUpperCase() || 'PALACE SPOT'}`,
        label: spot?.name || `Spot #${idx + 1}`,
        hint: `Imagine ${items[idx]?.word} interacting with the ${spot?.name || 'spot'}: ${items[idx]?.bizarreHint || 'Make it huge and bizarre!'}`,
      };
    } else if (techniqueId === 'peg') {
      const peg = pegRhymes[idx % pegRhymes.length];
      return {
        spotTag: `PEG #${peg.number} · ${peg.number} = ${peg.rhymeWord.toUpperCase()}`,
        label: `${peg.number} = ${peg.rhymeWord} ${peg.emoji}`,
        hint: `Combine ${items[idx]?.word} with a giant ${peg.rhymeWord}: ${peg.prompt}!`,
      };
    } else {
      // Linking
      if (idx === 0) {
        return {
          spotTag: 'STORY LINK 1 · THE OPENING',
          label: 'Start of the story',
          hint: `Picture ${items[idx]?.word} right in front of you: ${items[idx]?.bizarreHint || 'Huge and vivid!'}`,
        };
      }
      const prev = items[idx - 1];
      return {
        spotTag: `STORY LINK ${idx + 1} · COLLISION`,
        label: `${prev.word} → ${items[idx]?.word}`,
        hint: `Imagine ${prev.word} violently crashing into ${items[idx]?.word}!`,
      };
    }
  };

  const currentItem = items[currentMemorizeIndex];
  const anchor = getAnchorInfo(currentMemorizeIndex);

  const handleNextMemorize = () => {
    if (currentMemorizeIndex < items.length - 1) {
      setCurrentMemorizeIndex(currentMemorizeIndex + 1);
    } else {
      // Transition to Mental Walk Phase!
      setPhase('mental_walk');
    }
  };

  const handlePrevMemorize = () => {
    if (currentMemorizeIndex > 0) {
      setCurrentMemorizeIndex(currentMemorizeIndex - 1);
    }
  };

  // Generate 4 clean choices for active recall question
  const currentRecallOptions = useMemo(() => {
    if (phase !== 'recall') return [];
    const targetItem = items[currentRecallQuestionIdx];
    if (!targetItem) return [];

    const distractors = practiceItemPool
      .filter((p) => p.word !== targetItem.word)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    return [targetItem, ...distractors].sort(() => 0.5 - Math.random());
  }, [phase, currentRecallQuestionIdx, items]);

  const submitAnswer = (answeredWord: string) => {
    const updated = {
      ...userAnswers,
      [currentRecallQuestionIdx]: answeredWord.trim(),
    };
    setUserAnswers(updated);
    setTypedInput('');

    if (currentRecallQuestionIdx < items.length - 1) {
      setCurrentRecallQuestionIdx(currentRecallQuestionIdx + 1);
    } else {
      // Finish workout and tally score
      let correctCount = 0;
      items.forEach((it, idx) => {
        const ans = (updated[idx] || '').trim().toLowerCase();
        if (ans === it.word.toLowerCase()) {
          correctCount += 1;
        }
      });

      const accuracy = Math.round((correctCount / items.length) * 100);
      setSessionScore({
        correct: correctCount,
        total: items.length,
        accuracy,
      });

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

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <Header
        title={
          phase === 'memorize'
            ? 'Memorize'
            : phase === 'mental_walk'
            ? 'Mental Mode'
            : phase === 'recall'
            ? 'Recall'
            : 'Workout Results'
        }
        subtitle={
          phase === 'memorize'
            ? `Item ${currentMemorizeIndex + 1} of ${items.length}`
            : phase === 'recall'
            ? `Spot ${currentRecallQuestionIdx + 1} of ${items.length}`
            : `Level ${level} Complete`
        }
        onBack={phase === 'result' ? undefined : goBack}
      />

      {/* PHASE 1: IMMERSIVE SPOT-BY-SPOT MEMORIZATION */}
      {phase === 'memorize' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollBody,
            { paddingBottom: 60 + Math.max(insets.bottom, 20) },
          ]}
        >
          {/* Progress Bar */}
          <View style={styles.topProgress}>
            <Text style={styles.memorizeCounter}>
              ITEM {currentMemorizeIndex + 1} OF {items.length}
            </Text>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${((currentMemorizeIndex + 1) / items.length) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* Immersive Memorization Card */}
          <Card style={styles.immersiveCard}>
            <Text style={styles.anchorSpotTag}>{anchor.spotTag}</Text>
            <Text style={styles.hugeEmoji}>{currentItem.emoji}</Text>
            <Text style={styles.itemTitle}>{currentItem.word.toUpperCase()}</Text>

            <View style={styles.sceneBox}>
              <Text style={styles.scenePrompt}>{anchor.hint}</Text>
            </View>
          </Card>

          <View style={styles.navRow}>
            {currentMemorizeIndex > 0 && (
              <Button
                label="← Prev"
                onPress={handlePrevMemorize}
                variant="outline"
                size="normal"
                style={styles.prevBtn}
              />
            )}
            <Button
              label={
                currentMemorizeIndex === items.length - 1
                  ? 'Done memorizing →'
                  : 'Continue →'
              }
              onPress={handleNextMemorize}
              variant="palace"
              size="normal"
              style={{ flex: 1 }}
            />
          </View>
        </ScrollView>
      )}

      {/* PHASE 2: MENTAL MODE (Put phone down and walk route) */}
      {phase === 'mental_walk' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollBody,
            styles.centeredScroll,
            { paddingBottom: 60 + Math.max(insets.bottom, 20) },
          ]}
        >
          <View style={styles.mentalModeCircle}>
            <MaterialCommunityIcons name="eye-off" size={48} color={colors.palace} />
          </View>

          <Text style={styles.mentalModeTitle}>Put your phone down</Text>
          <Text style={styles.mentalModeBody}>
            Close your eyes and walk through your palace once.
          </Text>
          <Text style={[styles.mentalModeBody, { marginTop: spacing.s }]}>
            Check each spot: can you see the unusual scene you placed there?
          </Text>

          <Card variant="tinted" tintColor={colors.palaceLight} style={styles.mentalTipCard}>
            <Text style={styles.mentalTipText}>
              "Skill acquisition happens in the mind, not on the glass screen."
            </Text>
          </Card>

          <Button
            label="Ready to recall →"
            onPress={() => {
              setPhase('recall');
              setCurrentRecallQuestionIdx(0);
            }}
            variant="palace"
            style={{ width: '100%', marginTop: spacing.l }}
          />
        </ScrollView>
      )}

      {/* PHASE 3: RECALL CHALLENGE (Active retrieval) */}
      {phase === 'recall' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollBody,
            { paddingBottom: 60 + Math.max(insets.bottom, 20) },
          ]}
        >
          <View style={styles.topProgress}>
            <Text style={styles.memorizeCounter}>
              SPOT {currentRecallQuestionIdx + 1} OF {items.length}
            </Text>
          </View>

          <Card style={styles.questionCard}>
            <Text style={styles.recallAnchorLabel}>
              {getAnchorInfo(currentRecallQuestionIdx).spotTag}
            </Text>
            <Text style={styles.recallQuestionPrompt}>
              What item did you place here?
            </Text>
          </Card>

          {/* Mode Switcher: Choice vs Typing */}
          <View style={styles.recallModeSwitch}>
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
                  onPress={() => submitAnswer(opt.word)}
                  activeOpacity={0.7}
                  style={styles.choiceBtn}
                >
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
                style={styles.typeTextInput}
                onSubmitEditing={() => submitAnswer(typedInput)}
                autoFocus
              />
              <Button
                label="Submit Item"
                onPress={() => submitAnswer(typedInput)}
                disabled={!typedInput.trim()}
                variant="palace"
                style={{ marginTop: spacing.m }}
              />
            </View>
          )}
        </ScrollView>
      )}

      {/* PHASE 4: RESULTS */}
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
              {sessionScore.correct}/{sessionScore.total}
            </Text>
            <Text style={styles.resultAccuracyLabel}>
              {sessionScore.accuracy}% Recall
            </Text>
          </View>

          <Text style={styles.resultMainTitle}>
            {sessionScore.correct === sessionScore.total
              ? 'Flawless Recall 🎉'
              : 'Workout Complete 🧠'}
          </Text>

          {/* Coach Feedback */}
          <Card variant="tinted" tintColor={colors.surfaceMuted} style={styles.coachResultCard}>
            <Text style={styles.coachResultText}>
              {sessionScore.correct === sessionScore.total
                ? 'Outstanding recall. 👏 Your mental anchors held with complete accuracy.'
                : sessionScore.correct >= Math.round(sessionScore.total * 0.7)
                ? `Strong workout. You remembered ${sessionScore.correct} items. With practice, the remaining items will stick faster.`
                : "That's completely normal when starting out. Practice makes the technique easier to use."}
            </Text>
          </Card>

          {/* Baseline Improvement Comparison */}
          {profile.baselineScore && (
            <Card variant="tinted" tintColor={colors.successLight} style={styles.baselineCard}>
              <Text style={styles.baselineCompareTitle}>Improvement vs Baseline</Text>
              <Text style={styles.baselineBeforeAfter}>
                Before training: {profile.baselineScore.recalled} / {profile.baselineScore.total} items
              </Text>
              <Text style={styles.baselineAfterHighlight}>
                Today: {sessionScore.correct} / {sessionScore.total} items!
              </Text>
            </Card>
          )}

          {/* Item Breakdown */}
          <View style={styles.breakdownContainer}>
            <Text style={styles.breakdownHeader}>Session Review:</Text>
            {items.map((it, idx) => {
              const userAns = (userAnswers[idx] || '').trim().toLowerCase();
              const isMatch = userAns === it.word.toLowerCase();
              return (
                <View key={it.word} style={styles.breakdownItemRow}>
                  <Text style={styles.breakdownIndex}>#{idx + 1}</Text>
                  <Text style={styles.breakdownEmoji}>{it.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.breakdownWord}>{it.word}</Text>
                    {userAnswers[idx] && !isMatch && (
                      <Text style={styles.breakdownWrongText}>You: "{userAnswers[idx]}"</Text>
                    )}
                  </View>
                  <MaterialCommunityIcons
                    name={isMatch ? 'check-circle' : 'close-circle'}
                    size={22}
                    color={isMatch ? colors.success : colors.danger}
                  />
                </View>
              );
            })}
          </View>

          <View style={styles.resultActionRow}>
            <Button
              label="Try Again"
              onPress={() => {
                setPhase('memorize');
                setCurrentMemorizeIndex(0);
                setUserAnswers({});
                setCurrentRecallQuestionIdx(0);
              }}
              variant="outline"
              style={{ flex: 1 }}
            />
            <Button
              label="Done → Gym"
              onPress={() => goBack()}
              variant="palace"
              style={{ flex: 1 }}
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
  },
  centeredScroll: {
    alignItems: 'center',
    paddingTop: spacing.l,
  },
  topProgress: {
    marginBottom: spacing.l,
  },
  memorizeCounter: {
    ...typography.caption,
    color: colors.palace,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.palace,
    borderRadius: radius.pill,
  },
  immersiveCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  anchorSpotTag: {
    ...typography.caption,
    color: colors.palace,
    fontWeight: '700',
    marginBottom: spacing.m,
  },
  hugeEmoji: {
    fontSize: 68,
    marginBottom: spacing.s,
  },
  itemTitle: {
    ...typography.headingL,
    fontSize: 26,
    letterSpacing: 0.5,
    marginBottom: spacing.m,
  },
  sceneBox: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.l,
    borderRadius: radius.l,
    width: '100%',
  },
  scenePrompt: {
    ...typography.bodyL,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
    textAlign: 'center',
  },
  navRow: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  prevBtn: {
    width: 100,
  },
  mentalModeCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.palaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  mentalModeTitle: {
    ...typography.headingXL,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  mentalModeBody: {
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
  questionCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing.l,
  },
  recallAnchorLabel: {
    ...typography.caption,
    color: colors.palace,
    fontWeight: '700',
    marginBottom: spacing.s,
  },
  recallQuestionPrompt: {
    ...typography.headingL,
    fontSize: 20,
    color: colors.textPrimary,
  },
  recallModeSwitch: {
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
    backgroundColor: colors.surface,
    padding: spacing.l,
    borderRadius: radius.l,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  choiceText: {
    ...typography.bodyL,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  typeBox: {
    width: '100%',
  },
  typeTextInput: {
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
  resultMainTitle: {
    ...typography.headingL,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  baselineCard: {
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.l,
  },
  baselineCompareTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 4,
  },
  baselineBeforeAfter: {
    ...typography.bodyM,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  baselineAfterHighlight: {
    ...typography.bodyL,
    fontWeight: '700',
    color: colors.success,
  },
  breakdownContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.xl,
  },
  breakdownHeader: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.s,
    paddingHorizontal: spacing.s,
  },
  breakdownItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  breakdownIndex: {
    ...typography.caption,
    color: colors.textMuted,
    width: 28,
  },
  breakdownEmoji: {
    fontSize: 22,
    marginRight: spacing.s,
  },
  breakdownWord: {
    ...typography.bodyM,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  breakdownWrongText: {
    ...typography.bodyS,
    color: colors.danger,
  },
  coachResultCard: {
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.l,
    alignItems: 'center',
  },
  coachResultText: {
    ...typography.bodyM,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  resultActionRow: {
    flexDirection: 'row',
    gap: spacing.m,
  },
});

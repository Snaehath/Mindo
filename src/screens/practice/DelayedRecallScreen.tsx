import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, BackHandler } from 'react-native';
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
  const {
    params,
    goBack,
    recordRetentionReview,
    activeRetentionMemory,
    retentionMemories,
    navigate,
  } = useNavigation();

  // Target memory
  const memoryId: string = params?.memoryId || activeRetentionMemory?.id || '';
  const memory: ActiveRetentionMemory | undefined =
    retentionMemories.find((m) => m.id === memoryId) || activeRetentionMemory;

  const items = memory?.items || [
    { spotIndex: 0, spotName: 'Front Door', word: 'Candle', emoji: '🕯️', bizarreHint: '10-foot candle melting through the door with hot wax' },
    { spotIndex: 1, spotName: 'Living Room Sofa', word: 'Rocket', emoji: '🚀', bizarreHint: 'Thrusters smoking and scorching cushions' },
    { spotIndex: 2, spotName: 'Dining Table', word: 'Guitar', emoji: '🎸', bizarreHint: 'Strumming heavy metal chords loudly on its own' },
    { spotIndex: 3, spotName: 'Bedroom Bed', word: 'Banana', emoji: '🍌', bizarreHint: 'Giant banana tucked under duvet snoring' },
  ];

  const palaceName = memory?.palaceName || 'My Home Palace';
  const intervalDay = memory?.currentIntervalDay || 1;

  // Phases: 'walk' -> 'recall' -> 'result'
  const [phase, setPhase] = useState<'walk' | 'recall' | 'result'>('walk');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [recallMode, setRecallMode] = useState<'choice' | 'type'>('choice');
  const [typedInput, setTypedInput] = useState('');

  // Spatial hint level: 0 = closed, 1 = location cue, 2 = sensory clue
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);

  // Double-tap race condition guard
  const [isFinishing, setIsFinishing] = useState(false);

  // Android hardware back press support
  useEffect(() => {
    const onBackPress = () => {
      if (phase === 'walk') {
        goBack();
        return true;
      }
      if (phase === 'recall') {
        if (currentQuestionIdx > 0) {
          setCurrentQuestionIdx(currentQuestionIdx - 1);
          return true;
        }
        setPhase('walk');
        return true;
      }
      if (phase === 'result') {
        navigate('home');
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [phase, currentQuestionIdx]);

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
    setHintLevel(0); // Reset hint level for next question

    if (currentQuestionIdx < items.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      if (isFinishing) return;
      setIsFinishing(true);

      // Tally retention score
      let correct = 0;
      items.forEach((it, idx) => {
        if ((updated[idx] || '').trim().toLowerCase() === it.word.toLowerCase()) {
          correct += 1;
        }
      });

      if (memory) {
        // Record review and gracefully advance schedule
        recordRetentionReview(memory.id, correct, items.length);
      }
      setPhase('result');
    }
  };

  const correctCount = items.filter(
    (it, idx) => (userAnswers[idx] || '').trim().toLowerCase() === it.word.toLowerCase()
  ).length;

  const currentItem = items[currentQuestionIdx];

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <Header
        title="Retention Check-in"
        subtitle={
          phase === 'walk'
            ? `${intervalDay}-Day Check · ${palaceName}`
            : phase === 'recall'
            ? `Station ${currentQuestionIdx + 1} of ${items.length}`
            : 'Retention Results'
        }
        onBack={phase === 'result' ? undefined : goBack}
      />

      {/* ─────────────────────────────────────────────────────────────
          PHASE 1: MENTAL WALK (Calm, Non-Punitive)
         ───────────────────────────────────────────────────────────── */}
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
            Can you still retrieve the {items.length} items you placed here?
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
              setHintLevel(0);
            }}
            variant="palace"
            style={{ width: '100%', marginTop: spacing.xl }}
          />
        </ScrollView>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PHASE 2: ACTIVE RETRIEVAL (With Spatial Hints)
         ───────────────────────────────────────────────────────────── */}
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
              STATION {currentQuestionIdx + 1} OF {items.length}
            </Text>
          </View>

          <Card style={styles.questionCard}>
            <Text style={styles.recallSpotTag}>
              STATION {currentQuestionIdx + 1} · {currentItem?.spotName?.toUpperCase()}
            </Text>
            <Text style={styles.questionPrompt}>What was stored here?</Text>
          </Card>

          {/* Spatial Re-Anchoring Hints */}
          {hintLevel === 0 ? (
            <TouchableOpacity
              onPress={() => setHintLevel(1)}
              style={styles.hintToggleBtn}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="lightbulb-outline" size={16} color={colors.palace} />
              <Text style={styles.hintToggleText}>Need a spatial hint?</Text>
            </TouchableOpacity>
          ) : hintLevel === 1 ? (
            <Card variant="tinted" tintColor={colors.surfaceMuted} style={styles.hintCard}>
              <View style={styles.hintCardHeader}>
                <MaterialCommunityIcons name="map-marker-radius" size={18} color={colors.palace} />
                <Text style={styles.hintCardTitle}>Spatial Location Cue</Text>
              </View>
              <Text style={styles.hintCardBody}>
                Think about the <Text style={{ fontWeight: '700' }}>{currentItem?.spotName}</Text>. Look around that spot in your mind. What was happening there?
              </Text>
              <TouchableOpacity
                onPress={() => setHintLevel(2)}
                style={styles.hintNextBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.hintNextText}>Still blank? Reveal sensory clue →</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            <Card variant="tinted" tintColor={colors.palaceLight} style={styles.hintCard}>
              <View style={styles.hintCardHeader}>
                <MaterialCommunityIcons name="eye-outline" size={18} color={colors.palace} />
                <Text style={styles.hintCardTitle}>Sensory Clue</Text>
              </View>
              <Text style={styles.hintCardBody}>
                {currentItem?.bizarreHint || 'Picture something unusual interacting with this spot.'}
              </Text>
            </Card>
          )}

          {/* Mode Switch: Options vs Type Pro */}
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

      {/* ─────────────────────────────────────────────────────────────
          PHASE 3: RETENTION RESULTS (Quiet, Coach-Like)
         ───────────────────────────────────────────────────────────── */}
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
            {correctCount === items.length
              ? 'Anchors holding with 100% fidelity'
              : correctCount === items.length - 1
              ? 'Strong retention · One slipped'
              : 'Good retention workout'}
          </Text>

          {/* Quiet Coach Observation */}
          <Card variant="tinted" tintColor={colors.surfaceMuted} style={styles.coachCard}>
            <Text style={styles.coachBody}>
              {correctCount === items.length
                ? `All ${items.length} items were successfully retrieved after ${intervalDay} day${intervalDay > 1 ? 's' : ''}. Your palace is holding strong.`
                : correctCount === items.length - 1
                ? `You remembered ${correctCount} items. One slipped from its spot. Re-anchor it below so it sticks for the next check-in.`
                : `You retrieved ${correctCount} items. Spaced retrieval highlights which spots need another mental walk.`}
            </Text>
          </Card>

          {/* Review Breakdown & Spatial Re-Anchoring */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewHeading}>Stations Breakdown:</Text>
            {items.map((it, idx) => {
              const userAns = (userAnswers[idx] || '').trim().toLowerCase();
              const isMatch = userAns === it.word.toLowerCase();

              return (
                <View
                  key={`${it.word}_${idx}`}
                  style={[styles.reviewRow, !isMatch && styles.reviewRowSlipped]}
                >
                  <Text style={styles.reviewIndex}>#{idx + 1}</Text>
                  <Text style={styles.reviewEmoji}>{it.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewSpot}>{it.spotName}</Text>
                    <Text style={styles.reviewWord}>{it.word}</Text>
                    {!isMatch && (
                      <View style={styles.reAnchorBox}>
                        <Text style={styles.reAnchorLabel}>Re-anchor to {it.spotName}:</Text>
                        <Text style={styles.reAnchorText}>
                          {it.bizarreHint || 'Picture it vividly interacting with this spot.'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <MaterialCommunityIcons
                    name={isMatch ? 'check-circle' : 'alert-circle-outline'}
                    size={22}
                    color={isMatch ? colors.success : colors.palace}
                  />
                </View>
              );
            })}
          </View>

          <Button
            label="Done → Back to Home"
            onPress={() => navigate('home')}
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
    marginBottom: spacing.m,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  recallSpotTag: {
    ...typography.caption,
    color: colors.palace,
    fontWeight: '700',
    marginBottom: spacing.s,
  },
  questionPrompt: {
    ...typography.headingL,
    fontSize: 22,
    color: colors.textPrimary,
  },

  // Hints
  hintToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingVertical: spacing.s,
    marginBottom: spacing.m,
  },
  hintToggleText: {
    ...typography.bodyM,
    fontWeight: '600',
    color: colors.palace,
  },
  hintCard: {
    padding: spacing.m,
    borderRadius: radius.l,
    marginBottom: spacing.l,
  },
  hintCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  hintCardTitle: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.palace,
    letterSpacing: 0.8,
  },
  hintCardBody: {
    ...typography.bodyM,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  hintNextBtn: {
    marginTop: spacing.s,
  },
  hintNextText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.palace,
  },

  // Mode Switch
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    padding: 3,
    marginBottom: spacing.l,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  modeTabActive: {
    backgroundColor: colors.surface,
  },
  modeTabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: colors.palace,
    fontWeight: '700',
  },

  // Choices
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
    justifyContent: 'center',
  },
  choiceBtn: {
    width: '46%',
    backgroundColor: colors.surface,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.l,
    borderRadius: radius.l,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  choiceEmoji: {
    fontSize: 36,
    marginBottom: spacing.s,
  },
  choiceText: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.textPrimary,
  },

  // Type Pro Box
  typeBox: {
    width: '100%',
  },
  typeInput: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.l,
    padding: spacing.l,
    ...typography.bodyL,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // Results
  resultScoreCircle: {
    alignItems: 'center',
    marginVertical: spacing.l,
  },
  resultScoreNum: {
    ...typography.headingXL,
    fontSize: 48,
    fontWeight: '800',
    color: colors.palace,
  },
  resultAccuracyLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  resultTitle: {
    ...typography.headingL,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  coachCard: {
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.xl,
  },
  coachBody: {
    ...typography.bodyM,
    color: colors.textPrimary,
    lineHeight: 22,
    textAlign: 'center',
  },
  reviewSection: {
    marginBottom: spacing.l,
  },
  reviewHeading: {
    ...typography.headingM,
    marginBottom: spacing.m,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: radius.l,
    marginBottom: spacing.s,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.m,
  },
  reviewRowSlipped: {
    borderColor: colors.palaceLight,
    backgroundColor: colors.surface,
  },
  reviewIndex: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
  },
  reviewEmoji: {
    fontSize: 24,
  },
  reviewSpot: {
    ...typography.caption,
    color: colors.palace,
    fontWeight: '700',
  },
  reviewWord: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.textPrimary,
  },
  reAnchorBox: {
    marginTop: 4,
    backgroundColor: colors.palaceLight,
    padding: 6,
    borderRadius: radius.s,
  },
  reAnchorLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.palace,
    fontWeight: '700',
  },
  reAnchorText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textPrimary,
    marginTop: 2,
  },
});

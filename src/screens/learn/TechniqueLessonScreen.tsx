import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, typography, spacing, radius } from '../../theme';
import { techniqueModules } from '../../data/lessonsData';
import { TechniqueType } from '../../types';

export const TechniqueLessonScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { params, goBack, navigate, updateTechniqueStep, techniqueProgress, palaces } = useNavigation();
  const techniqueId: TechniqueType = params?.techniqueId || 'palace';
  const moduleData = techniqueModules[techniqueId];

  const currentSavedStep = techniqueProgress[techniqueId].completedSteps;
  const [activeStepIndex, setActiveStepIndex] = useState<number>(
    Math.min(5, Math.max(0, currentSavedStep - 1))
  );

  // Step 2 interactive association state
  const [chosenAssociation, setChosenAssociation] = useState<number | null>(null);

  // Step 3 interactive spot selection state
  const [chosenSpot, setChosenSpot] = useState<string | null>(null);

  // Step 4 interactive item placing state: map of spot index to placed item id
  const [placedItems, setPlacedItems] = useState<Record<number, string>>({});
  const [selectedItemToPlace, setSelectedItemToPlace] = useState<string | null>(null);

  // Step 5 recall state
  const [recallPhase, setRecallPhase] = useState<'prompt' | 'test' | 'results'>('prompt');
  const [userRecallInputs, setUserRecallInputs] = useState<Record<number, string>>({});

  const palaceSpots = [
    { order: 1, name: 'Front Door', icon: 'door' },
    { order: 2, name: 'Living Room Sofa', icon: 'sofa' },
    { order: 3, name: 'Dining Table', icon: 'silverware-fork-knife' },
    { order: 4, name: 'Bedroom Bed', icon: 'bed' },
  ];

  const itemsToPlace = [
    { id: 'pineapple', name: 'Pineapple', emoji: '🍍', hint: 'Jammed into the doorway wearing sunglasses' },
    { id: 'guitar', name: 'Guitar', emoji: '🎸', hint: 'Blasting heavy metal music on the sofa cushions' },
    { id: 'basketball', name: 'Basketball', emoji: '🏀', hint: 'Spinning in a hot soup bowl on the table' },
    { id: 'clock', name: 'Alarm Clock', emoji: '⏰', hint: 'Bouncing and ringing like an earthquake on the bed' },
  ];

  const handleNextStep = async () => {
    const nextStepNum = activeStepIndex + 2;
    await updateTechniqueStep(techniqueId, nextStepNum);

    if (activeStepIndex < 5) {
      setActiveStepIndex(activeStepIndex + 1);
    } else {
      // Transition from Lesson to Training Gym!
      navigate('practiceSession', { techniqueId, level: 1 });
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
    } else {
      goBack();
    }
  };

  const canProceed = (): boolean => {
    if (activeStepIndex === 1) return chosenAssociation !== null;
    if (activeStepIndex === 2) return chosenSpot !== null;
    if (activeStepIndex === 3) return Object.keys(placedItems).length === 4;
    if (activeStepIndex === 4) return recallPhase === 'results';
    return true;
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <Header
        title={moduleData.title}
        subtitle="Technique Workout"
        onBack={handlePrevStep}
      />

      {/* Step Indicator */}
      <View style={styles.stepHeaderWrap}>
        <Text style={styles.stepCounterText}>STEP {activeStepIndex + 1} OF 6</Text>
        <View style={styles.stepDotsRow}>
          {Array.from({ length: 6 }).map((_, idx) => {
            const isCompleted = idx <= activeStepIndex;
            return (
              <React.Fragment key={idx}>
                <View
                  style={[
                    styles.stepDot,
                    isCompleted && { backgroundColor: moduleData.badgeColor },
                  ]}
                />
                {idx < 5 && (
                  <View
                    style={[
                      styles.stepConnector,
                      idx < activeStepIndex && { backgroundColor: moduleData.badgeColor },
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: 120 + Math.max(insets.bottom, 16) },
        ]}
      >
        {/* STEP 1: UNDERSTAND (Clean, visual house anchor) */}
        {activeStepIndex === 0 && (
          <View style={styles.stepSection}>
            <Text style={styles.stepTitle}>Your Brain Loves Places</Text>
            <Text style={styles.leadParagraph}>
              Think about your home.
            </Text>
            <Text style={styles.bodyParagraph}>
              You can easily picture your front door, sofa, dining table, and bed without being there.
            </Text>
            <Text style={[styles.bodyParagraph, { fontWeight: '600', color: colors.textPrimary }]}>
              A Memory Palace uses those familiar spots as anchors for new information.
            </Text>

            {/* Visual House Layout */}
            <View style={styles.houseGraphicBox}>
              <View style={styles.houseRow}>
                <View style={styles.roomBox}>
                  <MaterialCommunityIcons name="door" size={28} color={colors.palace} />
                  <Text style={styles.roomName}>1. Front Door</Text>
                </View>
                <MaterialCommunityIcons name="arrow-right" size={20} color={colors.textMuted} />
                <View style={styles.roomBox}>
                  <MaterialCommunityIcons name="sofa" size={28} color={colors.palace} />
                  <Text style={styles.roomName}>2. Sofa</Text>
                </View>
              </View>

              <View style={styles.houseRow}>
                <View style={styles.roomBox}>
                  <MaterialCommunityIcons name="silverware-fork-knife" size={28} color={colors.palace} />
                  <Text style={styles.roomName}>3. Dining Table</Text>
                </View>
                <MaterialCommunityIcons name="arrow-right" size={20} color={colors.textMuted} />
                <View style={styles.roomBox}>
                  <MaterialCommunityIcons name="bed" size={28} color={colors.palace} />
                  <Text style={styles.roomName}>4. Bed</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* STEP 2: SEE & INTERACTIVE ASSOCIATION */}
        {activeStepIndex === 1 && (
          <View style={styles.stepSection}>
            <Text style={styles.stepTitle}>Look at this</Text>

            <Card style={styles.exampleShowcaseCard}>
              <Text style={styles.spotTag}>SPOT 1 · FRONT DOOR</Text>
              <Text style={styles.bigEmoji}>🍌</Text>
              <Text style={styles.showcaseItemName}>Giant Banana</Text>
              <Text style={styles.showcaseDesc}>
                A 10-foot glowing banana is jammed into your doorway, squishing loudly as you push it open.
              </Text>
            </Card>

            <Text style={[styles.stepTitle, { marginTop: spacing.l }]}>Your turn</Text>
            <Text style={styles.bodyParagraph}>
              You need to place a <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Toothbrush 🪥</Text> at your next spot. How would you make it memorable?
            </Text>

            <View style={styles.optionsList}>
              {[
                { id: 0, text: 'A normal toothbrush lying on the sofa cushion', isBest: false },
                { id: 1, text: 'A giant electric toothbrush spraying blue foam everywhere', isBest: true },
                { id: 2, text: 'A toothbrush sitting quietly in a plastic cup', isBest: false },
              ].map((opt) => {
                const isSelected = chosenAssociation === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setChosenAssociation(opt.id)}
                    activeOpacity={0.7}
                    style={[
                      styles.choiceOptionBtn,
                      isSelected && styles.choiceOptionSelected,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                      size={22}
                      color={isSelected ? colors.palace : colors.textMuted}
                      style={{ marginRight: spacing.s }}
                    />
                    <Text
                      style={[
                        styles.choiceOptionText,
                        isSelected && { fontWeight: '700', color: colors.textPrimary },
                      ]}
                    >
                      {opt.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {chosenAssociation !== null && (
              <Card
                variant="tinted"
                tintColor={chosenAssociation === 1 ? colors.successLight : colors.warningLight}
                style={styles.feedbackNotice}
              >
                <Text style={styles.feedbackNoticeText}>
                  {chosenAssociation === 1
                    ? '✨ Exactly. Vivid + unusual + action = almost impossible to forget.'
                    : '💡 Ordinary scenes fade quickly. Try making it bizarre, oversized, or animated!'}
                </Text>
              </Card>
            )}
          </View>
        )}

        {/* STEP 3: CHOOSE YOUR SPOT */}
        {activeStepIndex === 2 && (
          <View style={styles.stepSection}>
            <Text style={styles.stepTitle}>Choose your spot</Text>
            <Text style={styles.bodyParagraph}>
              You need to remember a <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Golden Crown 👑</Text>.
            </Text>
            <Text style={styles.subPrompt}>Where will you place it?</Text>

            <View style={styles.spotsChoiceGrid}>
              {palaceSpots.map((spot) => {
                const isPicked = chosenSpot === spot.name;
                return (
                  <TouchableOpacity
                    key={spot.name}
                    onPress={() => setChosenSpot(spot.name)}
                    activeOpacity={0.7}
                    style={[
                      styles.spotChoiceTile,
                      isPicked && styles.spotChoiceTileActive,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={spot.icon as any}
                      size={28}
                      color={isPicked ? colors.palace : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.spotChoiceName,
                        isPicked && { color: colors.palace, fontWeight: '700' },
                      ]}
                    >
                      {spot.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {chosenSpot && (
              <Card variant="tinted" tintColor={colors.palaceLight} style={styles.spotDetailCard}>
                <Text style={styles.spotDetailHeader}>Make it bizarre 🧠</Text>
                <Text style={styles.spotDetailBody}>
                  Imagine the golden crown melting with bubbling hot cheese all over your {chosenSpot}.
                </Text>
                <View style={styles.checkDoneRow}>
                  <MaterialCommunityIcons name="check-circle" size={20} color={colors.palace} />
                  <Text style={styles.checkDoneText}>Anchored to {chosenSpot}</Text>
                </View>
              </Card>
            )}
          </View>
        )}

        {/* STEP 4: PLACE ITEMS YOURSELF */}
        {activeStepIndex === 3 && (
          <View style={styles.stepSection}>
            <Text style={styles.stepTitle}>Place items yourself</Text>
            <Text style={styles.bodyParagraph}>
              Tap an item below, then tap the spot where you want to place it:
            </Text>

            {/* Palette of Items */}
            <View style={styles.itemsPalette}>
              {itemsToPlace.map((item) => {
                const isPlaced = Object.values(placedItems).includes(item.id);
                const isSelected = selectedItemToPlace === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setSelectedItemToPlace(item.id)}
                    disabled={isPlaced}
                    activeOpacity={0.7}
                    style={[
                      styles.paletteChip,
                      isSelected && styles.paletteChipSelected,
                      isPlaced && styles.paletteChipPlaced,
                    ]}
                  >
                    <Text style={styles.paletteEmoji}>{item.emoji}</Text>
                    <Text
                      style={[
                        styles.paletteLabel,
                        isSelected && { color: colors.palace, fontWeight: '700' },
                        isPlaced && { color: colors.textMuted },
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isPlaced && (
                      <MaterialCommunityIcons name="check" size={14} color={colors.success} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Palace Slots */}
            <Text style={styles.sectionSubHeading}>Your Palace Route:</Text>
            <View style={styles.slotsList}>
              {palaceSpots.map((spot, idx) => {
                const placedItemId = placedItems[idx];
                const placedObj = itemsToPlace.find((i) => i.id === placedItemId);

                return (
                  <TouchableOpacity
                    key={spot.name}
                    onPress={() => {
                      if (selectedItemToPlace) {
                        setPlacedItems({ ...placedItems, [idx]: selectedItemToPlace });
                        setSelectedItemToPlace(null);
                      }
                    }}
                    activeOpacity={0.8}
                    style={[
                      styles.slotCard,
                      placedObj && styles.slotCardFilled,
                      selectedItemToPlace && !placedObj && styles.slotCardTarget,
                    ]}
                  >
                    <View style={styles.slotOrderBadge}>
                      <Text style={styles.slotOrderNum}>#{idx + 1}</Text>
                    </View>
                    <View style={styles.slotDetails}>
                      <Text style={styles.slotSpotName}>{spot.name}</Text>
                      {placedObj ? (
                        <Text style={styles.slotPlacedDesc}>
                          {placedObj.emoji} {placedObj.name}: {placedObj.hint}
                        </Text>
                      ) : (
                        <Text style={styles.slotEmptyHint}>
                          {selectedItemToPlace ? 'Tap here to place item' : 'Empty spot'}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 5: RECALL WITHOUT HELP */}
        {activeStepIndex === 4 && (
          <View style={styles.stepSection}>
            {recallPhase === 'prompt' && (
              <View style={styles.mentalPromptBox}>
                <MaterialCommunityIcons name="eye-off-outline" size={44} color={colors.palace} />
                <Text style={styles.stepTitle}>Walk through your palace</Text>
                <Text style={styles.leadParagraph}>
                  Close your eyes for 10 seconds.
                </Text>
                <Text style={styles.bodyParagraph}>
                  Walk through your front door, sofa, table, and bed in your mind. Notice what you placed at each spot.
                </Text>

                <Button
                  label="I walked through — Test My Memory →"
                  onPress={() => setRecallPhase('test')}
                  variant="palace"
                  style={{ marginTop: spacing.l }}
                />
              </View>
            )}

            {recallPhase === 'test' && (
              <View>
                <Text style={styles.stepTitle}>What was at each spot?</Text>
                <Text style={styles.bodyParagraph}>
                  Retrieve the items from your mental walk:
                </Text>

                <View style={styles.recallQuizList}>
                  {palaceSpots.map((spot, idx) => {
                    const currentVal = userRecallInputs[idx] || '';
                    const targetItem = itemsToPlace[idx];
                    return (
                      <Card key={spot.name} style={styles.recallTestCard}>
                        <Text style={styles.recallTestSpot}>
                          Spot #{idx + 1} · {spot.name}
                        </Text>
                        <TextInput
                          value={currentVal}
                          onChangeText={(txt) =>
                            setUserRecallInputs({ ...userRecallInputs, [idx]: txt })
                          }
                          placeholder="Type what you placed here..."
                          placeholderTextColor={colors.textMuted}
                          style={styles.recallInput}
                        />
                      </Card>
                    );
                  })}
                </View>

                <Button
                  label="Reveal & Check Answers"
                  onPress={() => setRecallPhase('results')}
                  variant="palace"
                />
              </View>
            )}

            {recallPhase === 'results' && (
              <View>
                <Text style={styles.stepTitle}>Your Palace Recall</Text>
                <View style={styles.recallReviewList}>
                  {palaceSpots.map((spot, idx) => {
                    const inputVal = userRecallInputs[idx] || '';
                    const target = itemsToPlace[idx];
                    const isMatch =
                      inputVal.trim().toLowerCase() === target.name.toLowerCase();

                    return (
                      <Card key={spot.name} style={styles.recallReviewCard}>
                        <View style={styles.recallReviewRow}>
                          <Text style={styles.reviewEmoji}>{target.emoji}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.reviewSpotName}>{spot.name}</Text>
                            <Text style={styles.reviewTargetName}>Target: {target.name}</Text>
                            {inputVal ? (
                              <Text style={styles.reviewYourInput}>Your recall: "{inputVal}"</Text>
                            ) : null}
                          </View>
                          <MaterialCommunityIcons
                            name={isMatch ? 'check-circle' : 'information-outline'}
                            size={24}
                            color={isMatch ? colors.success : colors.palace}
                          />
                        </View>
                      </Card>
                    );
                  })}
                </View>

                <Card variant="tinted" tintColor={colors.successLight} style={styles.honestFeedback}>
                  <Text style={styles.honestFeedbackTitle}>Active Recall Complete 🎉</Text>
                  <Text style={styles.honestFeedbackBody}>
                    You walked your palace and retrieved memories without external hints.
                  </Text>
                </Card>
              </View>
            )}
          </View>
        )}

        {/* STEP 6: REAL-WORLD CHALLENGE & TRANSITION TO GYM */}
        {activeStepIndex === 5 && (
          <View style={styles.stepSection}>
            <View style={styles.learnedBox}>
              <MaterialCommunityIcons name="school" size={48} color={colors.palace} />
              <Text style={styles.learnedTitle}>You've learned the Memory Palace 🎉</Text>
              <Text style={styles.learnedDesc}>
                You now know the exact mechanism: link unfamiliar information to familiar physical locations using vivid, bizarre imagery.
              </Text>
            </View>

            <Card style={styles.realWorldCard}>
              <Text style={styles.realWorldHeader}>Real-World Application</Text>
              <View style={styles.applicationRow}>
                <Text style={styles.appBullet}>•</Text>
                <Text style={styles.appText}>Grocery runs without reaching for a phone</Text>
              </View>
              <View style={styles.applicationRow}>
                <Text style={styles.appBullet}>•</Text>
                <Text style={styles.appText}>Delivering a speech or presentation without notes</Text>
              </View>
              <View style={styles.applicationRow}>
                <Text style={styles.appBullet}>•</Text>
                <Text style={styles.appText}>Memorizing daily to-dos in exact sequence</Text>
              </View>
            </Card>

            <Card variant="tinted" tintColor={colors.palaceLight} style={styles.gymTransitionCard}>
              <Text style={styles.gymTransitionTitle}>Now let's train it.</Text>
              <Text style={styles.gymTransitionBody}>
                Learning the concept takes 5 minutes. Building superhuman recall requires progressive workouts in the Gym.
              </Text>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Bottom Floating Navigation Action */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button
          label={activeStepIndex === 5 ? 'Start Training →' : `Next Step →`}
          onPress={handleNextStep}
          disabled={!canProceed()}
          variant="palace"
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
  },
  stepHeaderWrap: {
    paddingHorizontal: spacing.l,
    marginBottom: spacing.m,
  },
  stepCounterText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.palace,
    letterSpacing: 1,
    marginBottom: spacing.s,
  },
  stepDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceMuted,
  },
  stepConnector: {
    flex: 1,
    height: 3,
    backgroundColor: colors.surfaceMuted,
  },
  scrollBody: {
    paddingHorizontal: spacing.l,
  },
  stepSection: {
    width: '100%',
  },
  stepTitle: {
    ...typography.headingXL,
    fontSize: 24,
    marginBottom: spacing.m,
  },
  leadParagraph: {
    ...typography.headingM,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.s,
  },
  bodyParagraph: {
    ...typography.bodyL,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.m,
  },
  subPrompt: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.m,
  },
  houseGraphicBox: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.l,
    gap: spacing.l,
    marginTop: spacing.s,
    marginBottom: spacing.l,
  },
  houseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.palaceLight,
    paddingVertical: spacing.m,
    borderRadius: radius.m,
  },
  roomName: {
    ...typography.bodyS,
    fontWeight: '700',
    color: colors.palace,
    marginTop: 4,
  },
  exampleShowcaseCard: {
    padding: spacing.l,
    borderRadius: radius.xl,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.palace,
    marginBottom: spacing.m,
  },
  spotTag: {
    ...typography.caption,
    color: colors.palace,
    fontWeight: '700',
    marginBottom: spacing.s,
  },
  bigEmoji: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  showcaseItemName: {
    ...typography.headingM,
    marginBottom: spacing.xs,
  },
  showcaseDesc: {
    ...typography.bodyM,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  optionsList: {
    gap: spacing.s,
    marginBottom: spacing.l,
  },
  choiceOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.l,
    padding: spacing.m,
  },
  choiceOptionSelected: {
    borderColor: colors.palace,
    backgroundColor: colors.palaceLight,
  },
  choiceOptionText: {
    flex: 1,
    ...typography.bodyM,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  feedbackNotice: {
    padding: spacing.m,
    borderRadius: radius.m,
    marginBottom: spacing.l,
  },
  feedbackNoticeText: {
    ...typography.bodyM,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  spotsChoiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    marginBottom: spacing.l,
  },
  spotChoiceTile: {
    width: '48%',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.l,
    paddingVertical: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotChoiceTileActive: {
    borderColor: colors.palace,
    backgroundColor: colors.palaceLight,
  },
  spotChoiceName: {
    ...typography.bodyM,
    marginTop: spacing.xs,
    color: colors.textPrimary,
  },
  spotDetailCard: {
    padding: spacing.l,
    borderRadius: radius.l,
  },
  spotDetailHeader: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.palace,
    marginBottom: spacing.xs,
  },
  spotDetailBody: {
    ...typography.bodyM,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.m,
  },
  checkDoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkDoneText: {
    ...typography.bodyS,
    fontWeight: '700',
    color: colors.palace,
  },
  itemsPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    marginBottom: spacing.l,
  },
  paletteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  paletteChipSelected: {
    borderColor: colors.palace,
    backgroundColor: colors.palaceLight,
  },
  paletteChipPlaced: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    opacity: 0.6,
  },
  paletteEmoji: {
    fontSize: 18,
  },
  paletteLabel: {
    ...typography.bodyS,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionSubHeading: {
    ...typography.headingM,
    fontSize: 16,
    marginBottom: spacing.s,
  },
  slotsList: {
    gap: spacing.s,
    marginBottom: spacing.l,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.l,
    padding: spacing.m,
  },
  slotCardFilled: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  slotCardTarget: {
    borderColor: colors.palace,
    borderStyle: 'dashed',
  },
  slotOrderBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  slotOrderNum: {
    ...typography.bodyS,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  slotDetails: {
    flex: 1,
  },
  slotSpotName: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  slotPlacedDesc: {
    ...typography.bodyS,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  slotEmptyHint: {
    ...typography.bodyS,
    color: colors.textMuted,
    marginTop: 2,
  },
  mentalPromptBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginTop: spacing.s,
  },
  recallQuizList: {
    gap: spacing.m,
    marginBottom: spacing.l,
  },
  recallTestCard: {
    padding: spacing.m,
  },
  recallTestSpot: {
    ...typography.caption,
    color: colors.palace,
    fontWeight: '700',
    marginBottom: spacing.s,
  },
  recallInput: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.m,
    paddingHorizontal: spacing.m,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.textPrimary,
  },
  recallReviewList: {
    gap: spacing.s,
    marginBottom: spacing.l,
  },
  recallReviewCard: {
    padding: spacing.m,
  },
  recallReviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewEmoji: {
    fontSize: 32,
    marginRight: spacing.m,
  },
  reviewSpotName: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  reviewTargetName: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewYourInput: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },
  honestFeedback: {
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.l,
  },
  honestFeedbackTitle: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.success,
    marginBottom: 4,
  },
  honestFeedbackBody: {
    ...typography.bodyM,
    color: colors.textSecondary,
  },
  learnedBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.l,
  },
  learnedTitle: {
    ...typography.headingL,
    fontSize: 20,
    textAlign: 'center',
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  learnedDesc: {
    ...typography.bodyM,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  realWorldCard: {
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.l,
  },
  realWorldHeader: {
    ...typography.headingM,
    fontSize: 16,
    marginBottom: spacing.m,
  },
  applicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  appBullet: {
    fontSize: 18,
    color: colors.palace,
    marginRight: spacing.s,
    fontWeight: '700',
  },
  appText: {
    ...typography.bodyM,
    color: colors.textSecondary,
    flex: 1,
  },
  gymTransitionCard: {
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.l,
  },
  gymTransitionTitle: {
    ...typography.headingM,
    fontSize: 17,
    color: colors.palace,
    marginBottom: 4,
  },
  gymTransitionBody: {
    ...typography.bodyM,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    zIndex: 999,
    elevation: 10,
  },
});

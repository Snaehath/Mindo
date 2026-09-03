import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StepBar } from '../../components/ProgressBar';
import { colors, typography, spacing, radius } from '../../theme';
import { techniqueModules, LessonStep } from '../../data/lessonsData';
import { TechniqueType } from '../../types';

export const TechniqueLessonScreen: React.FC = () => {
  const { params, goBack, navigate, updateTechniqueStep, techniqueProgress } = useNavigation();
  const techniqueId: TechniqueType = params?.techniqueId || 'palace';
  const moduleData = techniqueModules[techniqueId];

  const currentSavedStep = techniqueProgress[techniqueId].completedSteps;
  const [activeStepIndex, setActiveStepIndex] = useState<number>(
    Math.min(5, Math.max(0, currentSavedStep - 1))
  );

  // Quiz state for Step 5 (Recall)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Interactive trial state for Step 3/4
  const [imprintedItemIds, setImprintedItemIds] = useState<string[]>([]);

  const step: LessonStep = moduleData.steps[activeStepIndex];

  const handleNextStep = async () => {
    const nextStepNum = activeStepIndex + 2;
    await updateTechniqueStep(techniqueId, nextStepNum);

    if (activeStepIndex < 5) {
      setActiveStepIndex(activeStepIndex + 1);
      setSelectedAnswers({});
      setShowQuizResults(false);
    } else {
      // Finished all 6 steps!
      navigate('practiceSession', { techniqueId, level: 1 });
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
      setSelectedAnswers({});
      setShowQuizResults(false);
    } else {
      goBack();
    }
  };

  const toggleImprint = (id: string) => {
    if (imprintedItemIds.includes(id)) {
      setImprintedItemIds(imprintedItemIds.filter((item) => item !== id));
    } else {
      setImprintedItemIds([...imprintedItemIds, id]);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <Header
        title={moduleData.title}
        subtitle={`Step ${step.stepNumber} of 6: ${step.stepName}`}
        onBack={handlePrevStep}
      />

      <View style={styles.stepBarWrap}>
        <StepBar
          currentStep={step.stepNumber}
          totalSteps={6}
          color={moduleData.badgeColor}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Step Title & Subtitle */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
        </View>

        {/* Narrative / Explanation Text */}
        <View style={styles.textBlock}>
          {step.content.text.map((paragraph, idx) => (
            <Text key={idx} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>

        {/* Example Items (Step 2: See) */}
        {step.content.exampleItems && (
          <View style={styles.examplesList}>
            {step.content.exampleItems.map((ex, idx) => (
              <Card key={idx} style={styles.exampleCard}>
                <View style={styles.exampleHeader}>
                  <Text style={styles.exampleSpot}>{ex.spotOrPeg}</Text>
                  <Text style={styles.exampleEmoji}>{ex.emoji}</Text>
                </View>
                <Text style={styles.exampleLabel}>{ex.label}</Text>
                <Text style={styles.examplePrompt}>{ex.prompt}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* Interactive Placement (Step 3/4: Try & Practice) */}
        {step.content.interactiveItems && (
          <View style={styles.interactiveBlock}>
            <Text style={styles.interactiveInstruction}>
              Tap each item to imprint the mental picture:
            </Text>
            {step.content.interactiveItems.map((item) => {
              const isImprinted = imprintedItemIds.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => toggleImprint(item.id)}
                  activeOpacity={0.8}
                  style={[styles.interactiveCard, isImprinted && styles.interactiveCardDone]}
                >
                  <View style={styles.interactiveCardLeft}>
                    <Text style={styles.interactiveEmoji}>{item.emoji}</Text>
                    <View style={styles.interactiveCardTexts}>
                      <Text style={styles.interactiveItemName}>{item.name}</Text>
                      {item.associationPrompt && (
                        <Text style={styles.interactivePrompt}>{item.associationPrompt}</Text>
                      )}
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name={isImprinted ? 'check-circle' : 'checkbox-blank-circle-outline'}
                    size={24}
                    color={isImprinted ? colors.success : colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Quiz Recall (Step 5: Recall) */}
        {step.content.quizQuestions && (
          <View style={styles.quizBlock}>
            {step.content.quizQuestions.map((q, qIdx) => {
              const selected = selectedAnswers[qIdx];
              return (
                <Card key={qIdx} style={styles.quizCard}>
                  <Text style={styles.questionText}>
                    {qIdx + 1}. {q.question}
                  </Text>
                  <View style={styles.optionsList}>
                    {q.options.map((opt) => {
                      const isChosen = selected === opt;
                      const isCorrect = opt === q.correctAnswer;
                      let btnStyle = styles.quizOption;
                      if (showQuizResults) {
                        if (isCorrect) btnStyle = styles.quizOptionCorrect;
                        else if (isChosen && !isCorrect) btnStyle = styles.quizOptionWrong;
                      } else if (isChosen) {
                        btnStyle = styles.quizOptionSelected;
                      }

                      return (
                        <TouchableOpacity
                          key={opt}
                          onPress={() => {
                            if (!showQuizResults) {
                              setSelectedAnswers({ ...selectedAnswers, [qIdx]: opt });
                            }
                          }}
                          disabled={showQuizResults}
                          activeOpacity={0.7}
                          style={[styles.quizOptionBase, btnStyle]}
                        >
                          <Text
                            style={[
                              styles.quizOptionText,
                              isChosen && { fontWeight: '700' },
                            ]}
                          >
                            {opt}
                          </Text>
                          {showQuizResults && isCorrect && (
                            <MaterialCommunityIcons name="check" size={20} color={colors.success} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {showQuizResults && (
                    <Text style={styles.explanationText}>💡 {q.explanation}</Text>
                  )}
                </Card>
              );
            })}

            {!showQuizResults && (
              <Button
                label="Check Answers"
                onPress={() => setShowQuizResults(true)}
                disabled={
                  Object.keys(selectedAnswers).length <
                  (step.content.quizQuestions?.length || 0)
                }
                variant="outline"
                style={styles.checkAnswersBtn}
              />
            )}
          </View>
        )}

        {/* Step 6: Challenge Completion Banner */}
        {step.stepNumber === 6 && (
          <Card variant="tinted" tintColor={colors.successLight} style={styles.celebrationCard}>
            <MaterialCommunityIcons name="trophy" size={36} color={colors.success} />
            <Text style={styles.celebrationTitle}>Technique Mastered!</Text>
            <Text style={styles.celebrationSub}>
              You have completed the full 6-step curriculum. Now hit the gym to build superhuman recall speed!
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Bottom Floating Navigation Action */}
      <View style={styles.bottomBar}>
        <Button
          label={
            step.stepNumber === 6
              ? 'Start Practice Gym →'
              : `Next: Step ${step.stepNumber + 1} →`
          }
          onPress={handleNextStep}
          variant="primary"
          style={{ backgroundColor: moduleData.badgeColor }}
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
  stepBarWrap: {
    paddingHorizontal: spacing.l,
    marginBottom: spacing.m,
  },
  scrollBody: {
    paddingHorizontal: spacing.l,
    paddingBottom: 100,
  },
  stepHeader: {
    marginBottom: spacing.l,
  },
  stepTitle: {
    ...typography.headingXL,
    fontSize: 24,
    marginBottom: 4,
  },
  stepSubtitle: {
    ...typography.bodyM,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  textBlock: {
    gap: spacing.m,
    marginBottom: spacing.l,
  },
  paragraph: {
    ...typography.bodyL,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  examplesList: {
    gap: spacing.m,
    marginBottom: spacing.xl,
  },
  exampleCard: {
    padding: spacing.l,
    borderRadius: radius.l,
    borderLeftWidth: 4,
    borderLeftColor: colors.palace,
  },
  exampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  exampleSpot: {
    ...typography.caption,
    color: colors.palace,
    fontWeight: '700',
  },
  exampleEmoji: {
    fontSize: 24,
  },
  exampleLabel: {
    ...typography.headingM,
    fontSize: 17,
    marginBottom: 4,
  },
  examplePrompt: {
    ...typography.bodyM,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  interactiveBlock: {
    marginBottom: spacing.xl,
  },
  interactiveInstruction: {
    ...typography.bodyM,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.m,
  },
  interactiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.s,
  },
  interactiveCardDone: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  interactiveCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: spacing.s,
  },
  interactiveEmoji: {
    fontSize: 28,
    marginRight: spacing.m,
  },
  interactiveCardTexts: {
    flex: 1,
  },
  interactiveItemName: {
    ...typography.bodyL,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  interactivePrompt: {
    ...typography.bodyS,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  quizBlock: {
    gap: spacing.l,
    marginBottom: spacing.xl,
  },
  quizCard: {
    padding: spacing.l,
  },
  questionText: {
    ...typography.bodyL,
    fontWeight: '600',
    marginBottom: spacing.m,
  },
  optionsList: {
    gap: spacing.s,
  },
  quizOptionBase: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  quizOption: {
    backgroundColor: colors.surface,
  },
  quizOptionSelected: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primary,
  },
  quizOptionCorrect: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  quizOptionWrong: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },
  quizOptionText: {
    ...typography.bodyM,
    color: colors.textPrimary,
  },
  explanationText: {
    ...typography.bodyS,
    color: colors.textSecondary,
    marginTop: spacing.m,
    fontStyle: 'italic',
  },
  checkAnswersBtn: {
    marginTop: spacing.s,
  },
  celebrationCard: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
  },
  celebrationTitle: {
    ...typography.headingL,
    color: colors.success,
    marginTop: spacing.s,
    marginBottom: spacing.xs,
  },
  celebrationSub: {
    ...typography.bodyM,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ProgressBar } from '../../components/ProgressBar';
import { colors, typography, spacing, radius } from '../../theme';
import { techniqueModules } from '../../data/lessonsData';

export const HomeScreen: React.FC = () => {
  const { profile, techniqueProgress, navigate, activeRetentionMemory } = useNavigation();

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 👋';
    if (hour < 18) return 'Good afternoon 👋';
    return 'Good evening 👋';
  };

  // Determine Today's Training recommendation dynamically based on user progress
  const getTodayTraining = () => {
    const palaceSteps = techniqueProgress.palace.completedSteps;
    const linkingSteps = techniqueProgress.linking.completedSteps;
    const pegSteps = techniqueProgress.peg.completedSteps;

    if (palaceSteps < 6) {
      return {
        techniqueId: 'palace' as const,
        title: 'Memory Palace',
        subtitle: 'Remember 5 objects using your familiar spots.',
        actionLabel: 'Start →',
        action: () => navigate('techniqueDetail', { techniqueId: 'palace' }),
        color: colors.palace,
        lightColor: colors.palaceLight,
      };
    }
    if (linkingSteps < 6) {
      return {
        techniqueId: 'linking' as const,
        title: 'Linking / Story Method',
        subtitle: 'Chain bizarre mental links between 5 items.',
        actionLabel: 'Learn Technique →',
        action: () => navigate('techniqueDetail', { techniqueId: 'linking' }),
        color: colors.linking,
        lightColor: colors.linkingLight,
      };
    }
    if (pegSteps < 6) {
      return {
        techniqueId: 'peg' as const,
        title: 'The Peg System',
        subtitle: 'Learn the 1–10 number rhyme pegs for instant recall.',
        actionLabel: 'Learn Pegs →',
        action: () => navigate('techniqueDetail', { techniqueId: 'peg' }),
        color: colors.peg,
        lightColor: colors.pegLight,
      };
    }

    // Otherwise suggest daily practice
    return {
      techniqueId: 'palace' as const,
      title: 'Daily Palace Drill',
      subtitle: 'Remember 10 objects using your palace in Level 2.',
      actionLabel: 'Start Practice →',
      action: () => navigate('practiceSession', { techniqueId: 'palace', level: 2 }),
      color: colors.palace,
      lightColor: colors.palaceLight,
    };
  };

  const todayTraining = getTodayTraining();

  const getTechniqueStage = (
    completedSteps: number,
    totalPractices: number,
    bestScore: number
  ): string => {
    if (completedSteps < 6) return 'Learning';
    if (totalPractices < 3) return 'Practicing';
    if (totalPractices < 7 || bestScore < 10) return 'Developing';
    if (bestScore < 15) return 'Skilled';
    return 'Strong';
  };

  const palaceStage = getTechniqueStage(
    techniqueProgress.palace.completedSteps,
    techniqueProgress.palace.totalPractices,
    techniqueProgress.palace.bestScore
  );
  const linkingStage = getTechniqueStage(
    techniqueProgress.linking.completedSteps,
    techniqueProgress.linking.totalPractices,
    techniqueProgress.linking.bestScore
  );
  const pegStage = getTechniqueStage(
    techniqueProgress.peg.completedSteps,
    techniqueProgress.peg.totalPractices,
    techniqueProgress.peg.bestScore
  );

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Friendly Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.mainHeading}>Train your memory</Text>
        </View>
        {profile.streakDays > 0 && (
          <View style={styles.streakBadge}>
            <MaterialCommunityIcons name="fire" size={18} color="#EA580C" />
            <Text style={styles.streakText}>{profile.streakDays}d</Text>
          </View>
        )}
      </View>

      <Text style={styles.quoteSub}>5 minutes today can make a difference.</Text>

      {/* Spaced Retention Memory Check-in */}
      {activeRetentionMemory && (
        <Card
          variant="tinted"
          tintColor={colors.palaceLight}
          style={styles.retentionHomeCard}
        >
          <View style={styles.retentionHeaderRow}>
            <View style={styles.retentionBadge}>
              <MaterialCommunityIcons name="calendar-clock" size={14} color={colors.palace} />
              <Text style={styles.retentionBadgeText}>
                DAY {activeRetentionMemory.currentIntervalDay} RETENTION CHECK-IN
              </Text>
            </View>
            <Text style={styles.retentionItemCount}>
              {activeRetentionMemory.items.length} items
            </Text>
          </View>

          <Text style={styles.retentionCardTitle}>
            Can you walk through your palace?
          </Text>
          <Text style={styles.retentionCardSubtitle}>
            {activeRetentionMemory.items.length} items are stored in {activeRetentionMemory.palaceName}. Walk through from memory and see how many still hold.
          </Text>

          <View style={styles.heroButtonWrap}>
            <Button
              label={`Recall ${activeRetentionMemory.items.length} Items →`}
              onPress={() => navigate('delayedRecall', { memoryId: activeRetentionMemory.id })}
              variant="palace"
            />
          </View>
        </Card>
      )}

      {/* Primary Card: Today's Training */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Training</Text>
      </View>

      <Card
        variant="tinted"
        tintColor={todayTraining.lightColor}
        style={styles.heroCard}
      >
        <View style={styles.heroHeaderRow}>
          <Text style={[styles.heroBadge, { color: todayTraining.color }]}>
            RECOMMENDED WORKOUT
          </Text>
          <MaterialCommunityIcons
            name={
              todayTraining.techniqueId === 'palace'
                ? 'castle'
                : todayTraining.techniqueId === 'linking'
                ? 'link-variant'
                : 'format-list-numbered'
            }
            size={24}
            color={todayTraining.color}
          />
        </View>

        <Text style={styles.heroTitle}>{todayTraining.title}</Text>
        <Text style={styles.heroSubtitle}>{todayTraining.subtitle}</Text>

        <View style={styles.heroButtonWrap}>
          <Button
            label={todayTraining.actionLabel}
            onPress={todayTraining.action}
            style={{ backgroundColor: todayTraining.color }}
          />
        </View>
      </Card>

      {/* Your Progress */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
      </View>

      <Card style={styles.progressCard}>
        {/* Memory Palace */}
        <TouchableOpacity
          style={styles.techProgressRow}
          onPress={() => navigate('techniqueDetail', { techniqueId: 'palace' })}
          activeOpacity={0.7}
        >
          <View style={styles.techLabelRow}>
            <View style={styles.techTitleGroup}>
              <MaterialCommunityIcons name="castle" size={18} color={colors.palace} />
              <Text style={styles.techName}>Memory Palace</Text>
            </View>
            <View style={[styles.stageChip, { backgroundColor: colors.palaceLight }]}>
              <Text style={[styles.stageChipText, { color: colors.palace }]}>{palaceStage}</Text>
            </View>
          </View>
          {techniqueProgress.palace.bestScore > 0 && (
            <Text style={styles.personalBestHomeText}>
              Personal best: {techniqueProgress.palace.bestScore} items
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Linking */}
        <TouchableOpacity
          style={styles.techProgressRow}
          onPress={() => navigate('techniqueDetail', { techniqueId: 'linking' })}
          activeOpacity={0.7}
        >
          <View style={styles.techLabelRow}>
            <View style={styles.techTitleGroup}>
              <MaterialCommunityIcons name="link-variant" size={18} color={colors.linking} />
              <Text style={styles.techName}>Linking</Text>
            </View>
            <View style={[styles.stageChip, { backgroundColor: colors.linkingLight }]}>
              <Text style={[styles.stageChipText, { color: colors.linking }]}>{linkingStage}</Text>
            </View>
          </View>
          {techniqueProgress.linking.bestScore > 0 && (
            <Text style={styles.personalBestHomeText}>
              Personal best: {techniqueProgress.linking.bestScore} items
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Peg System */}
        <TouchableOpacity
          style={styles.techProgressRow}
          onPress={() => navigate('techniqueDetail', { techniqueId: 'peg' })}
          activeOpacity={0.7}
        >
          <View style={styles.techLabelRow}>
            <View style={styles.techTitleGroup}>
              <MaterialCommunityIcons name="format-list-numbered" size={18} color={colors.peg} />
              <Text style={styles.techName}>Peg System</Text>
            </View>
            <View style={[styles.stageChip, { backgroundColor: colors.pegLight }]}>
              <Text style={[styles.stageChipText, { color: colors.peg }]}>{pegStage}</Text>
            </View>
          </View>
          {techniqueProgress.peg.bestScore > 0 && (
            <Text style={styles.personalBestHomeText}>
              Personal best: {techniqueProgress.peg.bestScore} items
            </Text>
          )}
        </TouchableOpacity>
      </Card>

      {/* Quick Gym Action Shortcut */}
      <TouchableOpacity
        style={styles.quickPracticeBanner}
        onPress={() => navigate('practice')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="dumbbell" size={24} color={colors.primary} />
        <View style={styles.quickPracticeTextWrap}>
          <Text style={styles.quickPracticeTitle}>Visit the Memory Gym</Text>
          <Text style={styles.quickPracticeSub}>Practice with 5, 10, 15, or 20 items anytime.</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.l,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  greeting: {
    ...typography.bodyM,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  mainHeading: {
    ...typography.headingXL,
    color: colors.textPrimary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    paddingVertical: 4,
    paddingHorizontal: spacing.m,
    borderRadius: radius.pill,
    gap: 4,
  },
  streakText: {
    ...typography.bodyS,
    fontWeight: '700',
    color: '#9A3412',
  },
  quoteSub: {
    ...typography.bodyL,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    marginBottom: spacing.m,
  },
  sectionTitle: {
    ...typography.headingM,
    color: colors.textPrimary,
  },
  retentionHomeCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing.xxl,
    borderWidth: 1.5,
    borderColor: colors.palace,
  },
  retentionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  retentionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  retentionBadgeText: {
    ...typography.caption,
    color: colors.palace,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  retentionItemCount: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  retentionCardTitle: {
    ...typography.headingL,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  retentionCardSubtitle: {
    ...typography.bodyM,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.l,
  },
  heroCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing.xxl,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  heroBadge: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  heroTitle: {
    ...typography.headingL,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.bodyM,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.l,
  },
  heroButtonWrap: {
    marginTop: spacing.xs,
  },
  progressCard: {
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.xl,
  },
  techProgressRow: {
    paddingVertical: spacing.s,
  },
  techLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  techTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  techName: {
    ...typography.bodyM,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  techPercent: {
    ...typography.bodyS,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stageChip: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  stageChipText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  personalBestHomeText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.s,
  },
  quickPracticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.l,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickPracticeTextWrap: {
    flex: 1,
    marginLeft: spacing.m,
  },
  quickPracticeTitle: {
    ...typography.headingM,
    fontSize: 15,
  },
  quickPracticeSub: {
    ...typography.bodyS,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

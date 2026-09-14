import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ProgressBar } from '../../components/ProgressBar';
import { colors, typography, spacing, radius } from '../../theme';
import { calculateRecallStrength } from '../../utils/metrics';
import { isCapacityLevelUnlocked } from '../../utils/capacity';
import { ActiveRetentionMemory, UserPalace } from '../../types';

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    navigate,
    activeRetentionMemory,
    practiceHistory,
    retentionMemories,
    palaces,
    profile,
  } = useNavigation();

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // 1. Recall strength metrics
  const recallMetrics = calculateRecallStrength(practiceHistory, retentionMemories);
  const overallStrength = recallMetrics.overallStrength;

  // 2. Retention priority & overdue evaluation
  const now = Date.now();
  const activeMemories = (retentionMemories || []).filter((m) => m.status === 'active');

  // Due memories (scheduled time has arrived)
  const dueMemories = activeMemories.filter(
    (m) => now >= new Date(m.nextReviewDate).getTime()
  );

  const primaryDueMemory: ActiveRetentionMemory | undefined =
    dueMemories[0] || (activeRetentionMemory && dueMemories.includes(activeRetentionMemory) ? activeRetentionMemory : undefined);

  // Overdue memories (>24h past review date)
  const overdueMemories = activeMemories.filter(
    (m) => now - new Date(m.nextReviewDate).getTime() > 24 * 60 * 60 * 1000
  );

  // Secondary alert for overdue memories
  const needsAttentionMemory: ActiveRetentionMemory | undefined =
    overdueMemories.find((m) => m.id !== primaryDueMemory?.id) ||
    (dueMemories.length > 1 ? dueMemories[1] : undefined);

  // 3. Current capacity level calculation
  let workoutLevel = 1;
  let workoutItemCount = 5;
  if (isCapacityLevelUnlocked(4, practiceHistory)) {
    workoutLevel = 4;
    workoutItemCount = 20;
  } else if (isCapacityLevelUnlocked(3, practiceHistory)) {
    workoutLevel = 3;
    workoutItemCount = 15;
  } else if (isCapacityLevelUnlocked(2, practiceHistory)) {
    workoutLevel = 2;
    workoutItemCount = 10;
  }

  const defaultPalace: UserPalace | undefined = palaces[0];

  const getRetentionStatusLabel = (memory: ActiveRetentionMemory): string => {
    const reviewTime = new Date(memory.nextReviewDate).getTime();
    const diffHours = Math.round((reviewTime - now) / (1000 * 3600));
    if (diffHours <= 0) return 'Due for recall';
    if (diffHours < 24) return 'Next: Tomorrow';
    const days = Math.round(diffHours / 24);
    return `Next: in ${days} days`;
  };

  const getPalaceActiveMemory = (palaceId: string) => {
    return activeMemories.find((m) => m.palaceId === palaceId);
  };

  return (
    <ScreenContainer
      scrollable
      contentContainerStyle={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 24) + 20 },
      ]}
    >
      {/* 1. Header: Greeting & Status */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.brandTitle}>MINDO</Text>
        </View>
        <Badge
          label={overallStrength !== null ? `${overallStrength}%` : 'Calibrating'}
          variant="palace"
          iconName="brain"
          size="normal"
        />
      </View>

      {/* 2. Primary Action Hero */}
      {primaryDueMemory ? (
        // State: Retention due (highest priority)
        <Card variant="elevated" style={styles.heroActionCardDue}>
          <View style={styles.heroHeaderRow}>
            <Badge label="RETENTION CHECK-IN DUE" variant="palace" iconName="bell-ring" size="small" />
          </View>

          <Text style={styles.heroTitle}>
            {primaryDueMemory.palaceName}
          </Text>
          <Text style={styles.heroSubtitle}>
            {primaryDueMemory.items.length} items · {primaryDueMemory.currentIntervalDay}-day retention check
          </Text>

          <View style={styles.heroActionBlock}>
            <Button
              label="Test Recall Now →"
              onPress={() => navigate('delayedRecall', { memoryId: primaryDueMemory.id })}
              variant="palace"
              size="large"
            />
          </View>
        </Card>
      ) : (
        // State: No retention due -> Today's workout
        <Card variant="elevated" style={styles.heroActionCardWorkout}>
          <View style={styles.heroHeaderRow}>
            <Badge label="TODAY'S WORKOUT" variant="palace" iconName="dumbbell" size="small" />
            <Text style={styles.heroCapacityPill}>{workoutItemCount} items</Text>
          </View>

          <Text style={styles.heroTitle}>
            {defaultPalace?.name || 'Memory Palace Drill'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {workoutItemCount} spots · ~2 minutes of spatial encoding & recall
          </Text>

          <View style={styles.heroActionBlock}>
            <Button
              label="Start Workout →"
              onPress={() =>
                navigate('practiceSession', {
                  techniqueId: 'palace',
                  level: workoutLevel,
                  itemCount: workoutItemCount,
                  palaceId: defaultPalace?.id,
                })
              }
              variant="palace"
              size="large"
            />
          </View>
        </Card>
      )}

      {/* 3. Recall Strength Card */}
      <Card variant="tinted" tintColor={colors.palaceLight} style={styles.metricCard}>
        <View style={styles.metricHeaderRow}>
          <Text style={styles.metricHeaderLabel}>RECALL STRENGTH</Text>
          <MaterialCommunityIcons
            name={
              overallStrength === null
                ? 'battery-outline'
                : overallStrength >= 80
                ? 'battery-high'
                : overallStrength >= 50
                ? 'battery-medium'
                : 'battery-low'
            }
            size={20}
            color={overallStrength === null ? colors.textMuted : colors.palace}
          />
        </View>

        <View style={styles.metricScoreRow}>
          <Text
            style={[
              styles.metricScoreNumber,
              overallStrength === null && styles.metricScoreUnmeasured,
            ]}
          >
            {overallStrength !== null ? `${overallStrength} / 100` : 'Not measured yet'}
          </Text>
          <Text style={styles.metricStatusTag}>
            {overallStrength !== null ? recallMetrics.stageLabel : 'Complete a drill'}
          </Text>
        </View>

        {/* Reusable Progress Bar */}
        <ProgressBar
          progress={overallStrength !== null ? overallStrength / 100 : 0}
          color={colors.palace}
          height={8}
          style={styles.gaugeBar}
        />

        <Text style={styles.metricFooterNote}>
          {overallStrength !== null
            ? (retentionMemories || []).some((m) => m.reviews && m.reviews.length > 0)
              ? 'Based on verified recall & retention'
              : 'Based on verified recall & training capacity'
            : 'Complete your first practice drill to calibrate'}
        </Text>
      </Card>

      {/* 4. Needs Attention Card */}
      {needsAttentionMemory && (
        <Card variant="tinted" tintColor={colors.surfaceMuted} style={styles.attentionCard}>
          <View style={styles.attentionHeaderRow}>
            <MaterialCommunityIcons name="clock-alert-outline" size={20} color={colors.palace} />
            <Text style={styles.attentionHeaderTitle}>NEEDS ATTENTION</Text>
          </View>

          <Text style={styles.attentionTitle}>{needsAttentionMemory.palaceName}</Text>
          <Text style={styles.attentionBody}>
            {needsAttentionMemory.items.length} items may be fading · Overdue for review
          </Text>

          <TouchableOpacity
            style={styles.attentionActionBtn}
            onPress={() => navigate('delayedRecall', { memoryId: needsAttentionMemory.id })}
            activeOpacity={0.7}
          >
            <Text style={styles.attentionActionText}>Review Now →</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* 5. Active Palaces Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Palaces</Text>
        <TouchableOpacity
          onPress={() => navigate('palaceBuilder')}
          activeOpacity={0.7}
        >
          <Text style={styles.sectionActionText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.palacesList}>
        {palaces.map((palace) => {
          const activeMemory = getPalaceActiveMemory(palace.id);
          const statusText = activeMemory
            ? getRetentionStatusLabel(activeMemory)
            : 'Ready for workout';
          const isDue = activeMemory && now >= new Date(activeMemory.nextReviewDate).getTime();

          return (
            <TouchableOpacity
              key={palace.id}
              style={styles.palaceRow}
              onPress={() => {
                if (activeMemory && isDue) {
                  navigate('delayedRecall', { memoryId: activeMemory.id });
                } else {
                  navigate('practiceSession', {
                    techniqueId: 'palace',
                    level: workoutLevel,
                    itemCount: workoutItemCount,
                    palaceId: palace.id,
                  });
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.palaceIconCircle}>
                <MaterialCommunityIcons
                  name="castle"
                  size={20}
                  color={colors.palace}
                />
              </View>

              <View style={styles.palaceInfo}>
                <Text style={styles.palaceName}>{palace.name}</Text>
                <Text style={styles.palaceMeta}>
                  {palace.spots.length} stations ·{' '}
                  <Text style={[styles.palaceStatus, isDue && styles.palaceStatusDue]}>
                    {statusText}
                  </Text>
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.l,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  greeting: {
    ...typography.bodyM,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  brandTitle: {
    ...typography.headingL,
    fontSize: 24,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },

  heroActionCardDue: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing.l,
    borderWidth: 2,
    borderColor: colors.palace,
  },
  heroActionCardWorkout: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing.l,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  heroCapacityPill: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  heroTitle: {
    ...typography.headingXL,
    fontSize: 26,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.bodyM,
    color: colors.textSecondary,
    marginBottom: spacing.l,
  },
  heroActionBlock: {
    width: '100%',
  },

  // Metric Card (Recall Strength)
  metricCard: {
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.l,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metricHeaderLabel: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.palace,
  },
  metricScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.s,
    marginBottom: spacing.s,
  },
  metricScoreNumber: {
    ...typography.headingXL,
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  metricScoreUnmeasured: {
    fontSize: 22,
    fontWeight: '700',
  },
  metricStatusTag: {
    ...typography.bodyM,
    fontWeight: '600',
    color: colors.palace,
  },
  gaugeBar: {
    marginBottom: spacing.s,
  },
  metricFooterNote: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Needs Attention Card
  attentionCard: {
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: colors.palace,
  },
  attentionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    marginBottom: spacing.xs,
  },
  attentionHeaderTitle: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.palace,
  },
  attentionTitle: {
    ...typography.headingM,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  attentionBody: {
    ...typography.bodyM,
    color: colors.textSecondary,
    marginBottom: spacing.m,
  },
  attentionActionBtn: {
    alignSelf: 'flex-start',
  },
  attentionActionText: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.palace,
  },

  // Active Palaces Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
    marginTop: spacing.s,
  },
  sectionTitle: {
    ...typography.headingM,
    fontSize: 18,
    color: colors.textPrimary,
  },
  sectionActionText: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.palace,
  },
  palacesList: {
    gap: spacing.s,
  },
  palaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: radius.l,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  palaceIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.palaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  palaceInfo: {
    flex: 1,
  },
  palaceName: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  palaceMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  palaceStatus: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  palaceStatusDue: {
    color: colors.palace,
    fontWeight: '700',
  },
});

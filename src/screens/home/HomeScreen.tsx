import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, typography, spacing, radius } from '../../theme';
import { techniqueModules } from '../../data/lessonsData';

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { techniqueProgress, navigate, activeRetentionMemory } = useNavigation();

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 👋';
    if (hour < 18) return 'Good afternoon 👋';
    return 'Good evening 👋';
  };

  // Calculate individual skill strengths (0 - 100)
  const getSkillStrength = (completedSteps: number, totalPractices: number, bestScore: number) => {
    const stepPart = (completedSteps / 6) * 50; // up to 50% from steps
    const practicePart = Math.min(30, totalPractices * 6); // up to 30% from workouts
    const scorePart = Math.min(20, (bestScore / 15) * 20); // up to 20% from capacity
    return Math.max(12, Math.min(100, Math.round(stepPart + practicePart + scorePart)));
  };

  const getSkillStage = (strength: number): string => {
    if (strength < 25) return 'New';
    if (strength < 50) return 'Learning';
    if (strength < 75) return 'Building';
    if (strength < 90) return 'Skilled';
    return 'Strong';
  };

  const palaceStrength = getSkillStrength(
    techniqueProgress.palace.completedSteps,
    techniqueProgress.palace.totalPractices,
    techniqueProgress.palace.bestScore
  );
  const linkingStrength = getSkillStrength(
    techniqueProgress.linking.completedSteps,
    techniqueProgress.linking.totalPractices,
    techniqueProgress.linking.bestScore
  );
  const pegStrength = getSkillStrength(
    techniqueProgress.peg.completedSteps,
    techniqueProgress.peg.totalPractices,
    techniqueProgress.peg.bestScore
  );

  // Overall Recall Strength (weighted towards palace)
  const overallStrength = Math.round(
    palaceStrength * 0.5 + linkingStrength * 0.25 + pegStrength * 0.25
  );

  // Check if any retention memories need attention / refresh
  const isRetentionDue =
    activeRetentionMemory &&
    (new Date().getTime() >= new Date(activeRetentionMemory.nextReviewDate).getTime() ||
      activeRetentionMemory.reviews.length === 0);

  // Determine Today's Training recommendation
  const getTodayTraining = () => {
    const palaceSteps = techniqueProgress.palace.completedSteps;
    const linkingSteps = techniqueProgress.linking.completedSteps;
    const pegSteps = techniqueProgress.peg.completedSteps;

    if (palaceSteps < 6) {
      return {
        title: 'Memory Palace',
        subtitle: 'Learn familiar spots & bizarre imagery.',
        action: () => navigate('techniqueDetail', { techniqueId: 'palace' }),
      };
    }
    if (linkingSteps < 6) {
      return {
        title: 'Linking / Story',
        subtitle: 'Chain bizarre cause-and-effects.',
        action: () => navigate('techniqueDetail', { techniqueId: 'linking' }),
      };
    }
    if (pegSteps < 6) {
      return {
        title: 'Peg System',
        subtitle: 'Learn number rhyme pegs for instant recall.',
        action: () => navigate('techniqueDetail', { techniqueId: 'peg' }),
      };
    }

    return {
      title: 'Memory Palace Drill',
      subtitle: '10 items · ~3 min',
      action: () => navigate('practiceSession', { techniqueId: 'palace', level: 2 }),
    };
  };

  const todayTraining = getTodayTraining();

  return (
    <ScreenContainer
      scrollable={false}
      contentContainerStyle={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 16) + 12 },
      ]}
    >
      {/* 1. Header: Greeting & Quiet Mindo Branding */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.mainTitle}>Your Memory</Text>
        </View>
        <View style={styles.brandBadge}>
          <MaterialCommunityIcons name="brain" size={16} color={colors.palace} />
          <Text style={styles.brandBadgeText}>Mindo</Text>
        </View>
      </View>

      {/* 2. Core Card: Recall Strength Battery & Direct Action */}
      <Card variant="tinted" tintColor={colors.palaceLight} style={styles.batteryHeroCard}>
        <View style={styles.batteryHeaderRow}>
          <Text style={styles.batteryHeaderLabel}>RECALL STRENGTH</Text>
          <MaterialCommunityIcons
            name={
              overallStrength >= 80
                ? 'battery-high'
                : overallStrength >= 50
                ? 'battery-medium'
                : 'battery-low'
            }
            size={22}
            color={colors.palace}
          />
        </View>

        <View style={styles.strengthScoreRow}>
          <Text style={styles.strengthNumber}>{overallStrength}%</Text>
          <Text style={styles.strengthStatusTag}>
            {overallStrength >= 80 ? 'Looking strong' : 'Building consistency'}
          </Text>
        </View>

        {/* Tactile Battery Bar */}
        <View style={styles.batteryTrack}>
          <View style={[styles.batteryFill, { width: `${overallStrength}%` }]} />
        </View>

        {/* Coach Context & One Obvious Next Action */}
        {isRetentionDue && activeRetentionMemory ? (
          <View style={styles.actionBlock}>
            <Text style={styles.coachText}>
              {activeRetentionMemory.items.length} items could use a quick refresh.
            </Text>
            <Button
              label={`Strengthen Palace (${activeRetentionMemory.items.length} items) →`}
              onPress={() => navigate('delayedRecall', { memoryId: activeRetentionMemory.id })}
              variant="palace"
              size="normal"
            />
          </View>
        ) : (
          <View style={styles.actionBlock}>
            <Text style={styles.coachText}>
              Your recall is holding well. Ready for today's drill?
            </Text>
            <Button
              label={`Start: ${todayTraining.title} →`}
              onPress={todayTraining.action}
              variant="palace"
              size="normal"
            />
          </View>
        )}
      </Card>

      {/* 3. Your Skills: 3 Compact Capability Rows */}
      <View style={styles.skillsSection}>
        <Text style={styles.sectionHeaderTitle}>Your Skills</Text>

        <Card style={styles.skillsCard}>
          {/* Memory Palace */}
          <TouchableOpacity
            style={styles.skillRow}
            onPress={() => navigate('techniqueDetail', { techniqueId: 'palace' })}
            activeOpacity={0.7}
          >
            <View style={styles.skillIconBox}>
              <MaterialCommunityIcons name="castle" size={20} color={colors.palace} />
            </View>
            <View style={styles.skillInfo}>
              <View style={styles.skillTitleRow}>
                <Text style={styles.skillName}>Memory Palace</Text>
                <Text style={[styles.skillPercent, { color: colors.palace }]}>
                  {palaceStrength}% · {getSkillStage(palaceStrength)}
                </Text>
              </View>
              <View style={styles.miniTrack}>
                <View
                  style={[
                    styles.miniFill,
                    { width: `${palaceStrength}%`, backgroundColor: colors.palace },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.skillDivider} />

          {/* Linking */}
          <TouchableOpacity
            style={styles.skillRow}
            onPress={() => navigate('techniqueDetail', { techniqueId: 'linking' })}
            activeOpacity={0.7}
          >
            <View style={[styles.skillIconBox, { backgroundColor: colors.linkingLight }]}>
              <MaterialCommunityIcons name="link-variant" size={20} color={colors.linking} />
            </View>
            <View style={styles.skillInfo}>
              <View style={styles.skillTitleRow}>
                <Text style={styles.skillName}>Story Linking</Text>
                <Text style={[styles.skillPercent, { color: colors.linking }]}>
                  {linkingStrength}% · {getSkillStage(linkingStrength)}
                </Text>
              </View>
              <View style={styles.miniTrack}>
                <View
                  style={[
                    styles.miniFill,
                    { width: `${linkingStrength}%`, backgroundColor: colors.linking },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.skillDivider} />

          {/* Peg System */}
          <TouchableOpacity
            style={styles.skillRow}
            onPress={() => navigate('techniqueDetail', { techniqueId: 'peg' })}
            activeOpacity={0.7}
          >
            <View style={[styles.skillIconBox, { backgroundColor: colors.pegLight }]}>
              <MaterialCommunityIcons name="format-list-numbered" size={20} color={colors.peg} />
            </View>
            <View style={styles.skillInfo}>
              <View style={styles.skillTitleRow}>
                <Text style={styles.skillName}>Peg System</Text>
                <Text style={[styles.skillPercent, { color: colors.peg }]}>
                  {pegStrength}% · {getSkillStage(pegStrength)}
                </Text>
              </View>
              <View style={styles.miniTrack}>
                <View
                  style={[
                    styles.miniFill,
                    { width: `${pegStrength}%`, backgroundColor: colors.peg },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Card>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  greeting: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  mainTitle: {
    ...typography.headingXL,
    fontSize: 26,
    color: colors.textPrimary,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.palaceLight,
    paddingVertical: 5,
    paddingHorizontal: spacing.m,
    borderRadius: radius.pill,
  },
  brandBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.palace,
  },
  batteryHeroCard: {
    padding: spacing.l,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.palace,
  },
  batteryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  batteryHeaderLabel: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.palace,
  },
  strengthScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.s,
    marginBottom: spacing.s,
  },
  strengthNumber: {
    ...typography.headingXL,
    fontSize: 38,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  strengthStatusTag: {
    ...typography.bodyM,
    fontWeight: '600',
    color: colors.palace,
  },
  batteryTrack: {
    height: 10,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: spacing.m,
  },
  batteryFill: {
    height: '100%',
    backgroundColor: colors.palace,
    borderRadius: radius.pill,
  },
  actionBlock: {
    gap: spacing.s,
  },
  coachText: {
    ...typography.bodyM,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  skillsSection: {
    marginBottom: spacing.xs,
  },
  sectionHeaderTitle: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.s,
  },
  skillsCard: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: radius.l,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: spacing.m,
  },
  skillIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.palaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillInfo: {
    flex: 1,
  },
  skillTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  skillName: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  skillPercent: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 12,
  },
  miniTrack: {
    height: 5,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  skillDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
});

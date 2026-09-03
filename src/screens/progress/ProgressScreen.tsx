import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { MasteryBadge } from '../../components/Badge';
import { ProgressBar } from '../../components/ProgressBar';
import { Button } from '../../components/Button';
import { colors, typography, spacing, radius } from '../../theme';
import { techniqueModules } from '../../data/lessonsData';
import { TechniqueType } from '../../types';

export const ProgressScreen: React.FC = () => {
  const {
    profile,
    techniqueProgress,
    palaces,
    practiceHistory,
    resetAllData,
    navigate,
  } = useNavigation();

  const techniques: TechniqueType[] = ['palace', 'linking', 'peg'];

  // Latest / best workout score
  const latestWorkout = practiceHistory[0];

  const handleReset = () => {
    Alert.alert(
      'Reset All Training Data?',
      'This will erase your progress, baseline score, and workout history so you can restart as a fresh user.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <Header
        title="Your Progress"
        subtitle="Skill acquisition & measurable improvement"
      />

      {/* Baseline vs Training Improvement Card */}
      <Card variant="tinted" tintColor={colors.surfaceMuted} style={styles.baselineCompareCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeaderTitle}>Your Memory Challenge</Text>
          <MaterialCommunityIcons name="star-shooting" size={20} color={colors.palace} />
        </View>

        <View style={styles.compareRow}>
          <View style={styles.compareItem}>
            <Text style={styles.compareLabel}>Before Training</Text>
            <Text style={styles.compareValMuted}>
              {profile.baselineScore ? `${profile.baselineScore.recalled} / 8` : '—'}
            </Text>
            <Text style={styles.compareSub}>Raw recall</Text>
          </View>

          <MaterialCommunityIcons name="arrow-right-thin" size={32} color={colors.textMuted} />

          <View style={styles.compareItem}>
            <Text style={styles.compareLabel}>After Training</Text>
            <Text style={styles.compareValBold}>
              {latestWorkout ? `${latestWorkout.correctItems} / ${latestWorkout.totalItems}` : '—'}
            </Text>
            <Text style={styles.compareSub}>With techniques</Text>
          </View>
        </View>

        {profile.baselineScore && latestWorkout && (
          <View style={styles.improvementBadge}>
            <Text style={styles.improvementBadgeText}>
              You improved by +
              {Math.max(0, latestWorkout.correctItems - profile.baselineScore.recalled)} items. 🎉
            </Text>
          </View>
        )}
      </Card>

      {/* Technique Mastery Levels */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Technique Mastery</Text>
      </View>

      <View style={styles.masteryList}>
        {techniques.map((techId) => {
          const mod = techniqueModules[techId];
          const prog = techniqueProgress[techId];

          return (
            <Card key={techId} style={styles.masteryCard}>
              <View style={styles.masteryHeader}>
                <View style={styles.masteryTitleGroup}>
                  <MaterialCommunityIcons name={mod.icon as any} size={22} color={mod.badgeColor} />
                  <Text style={styles.masteryName}>{mod.title}</Text>
                </View>
                <MasteryBadge level={prog.masteryLevel} />
              </View>

              <View style={styles.masteryMetricsRow}>
                <View style={styles.metricCol}>
                  <Text style={styles.metricVal}>
                    {prog.averageAccuracy > 0 ? `${prog.averageAccuracy}%` : '—'}
                  </Text>
                  <Text style={styles.metricLabel}>Recall accuracy</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricCol}>
                  <Text style={styles.metricVal}>{prog.totalPractices}</Text>
                  <Text style={styles.metricLabel}>Workouts</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricCol}>
                  <Text style={styles.metricVal}>{prog.bestScore}</Text>
                  <Text style={styles.metricLabel}>Personal best</Text>
                </View>
              </View>
            </Card>
          );
        })}
      </View>

      {/* Memory Palaces Inventory */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Your Memory Palaces ({palaces.length})</Text>
        <TouchableOpacity onPress={() => navigate('palaceBuilder')}>
          <Text style={styles.addPalaceLink}>+ Add Palace</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.palacesList}>
        {palaces.map((p) => (
          <Card key={p.id} style={styles.palaceItemCard}>
            <View style={styles.palaceRow}>
              <View style={styles.palaceIconBox}>
                <MaterialCommunityIcons
                  name={p.iconName as any || 'home'}
                  size={24}
                  color={colors.palace}
                />
              </View>
              <View style={styles.palaceTextWrap}>
                <Text style={styles.palaceItemName}>{p.name}</Text>
                <Text style={styles.palaceItemSub}>{p.spots.length} sequential spots</Text>
              </View>
              <Button
                label="Drill"
                onPress={() =>
                  navigate('practiceSession', {
                    techniqueId: 'palace',
                    level: 1,
                    palaceId: p.id,
                  })
                }
                variant="outline"
                size="normal"
                style={styles.drillBtn}
              />
            </View>
          </Card>
        ))}
      </View>

      {/* Gym Stats Footer & Reset Option */}
      <View style={styles.footerSection}>
        <View style={styles.streakFooterBox}>
          <MaterialCommunityIcons name="fire" size={24} color="#EA580C" />
          <Text style={styles.streakFooterText}>
            {profile.streakDays}-Day Memory Training Habit
          </Text>
        </View>

        <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
          <Text style={styles.resetText}>Reset All App Data</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.m,
    paddingBottom: spacing.xxl,
  },
  baselineCompareCard: {
    padding: spacing.l,
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  cardHeaderTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: spacing.s,
  },
  compareItem: {
    alignItems: 'center',
  },
  compareLabel: {
    ...typography.bodyS,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  compareValMuted: {
    ...typography.headingXL,
    fontSize: 26,
    color: colors.textMuted,
  },
  compareValBold: {
    ...typography.headingXL,
    fontSize: 26,
    color: colors.palace,
    fontWeight: '800',
  },
  compareSub: {
    ...typography.bodyS,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  improvementBadge: {
    marginTop: spacing.m,
    backgroundColor: colors.successLight,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  improvementBadgeText: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.success,
  },
  sectionHeader: {
    marginBottom: spacing.m,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
    marginTop: spacing.s,
  },
  sectionTitle: {
    ...typography.headingM,
    color: colors.textPrimary,
  },
  addPalaceLink: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.palace,
  },
  masteryList: {
    gap: spacing.m,
    marginBottom: spacing.xl,
  },
  masteryCard: {
    padding: spacing.l,
    borderRadius: radius.l,
  },
  masteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  masteryTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  masteryName: {
    ...typography.headingM,
    fontSize: 16,
  },
  masteryMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.m,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  metricCol: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    ...typography.headingM,
    fontSize: 16,
    fontWeight: '700',
  },
  metricLabel: {
    ...typography.bodyS,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  palacesList: {
    gap: spacing.s,
    marginBottom: spacing.xxl,
  },
  palaceItemCard: {
    padding: spacing.m,
    borderRadius: radius.l,
  },
  palaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  palaceIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.palaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  palaceTextWrap: {
    flex: 1,
  },
  palaceItemName: {
    ...typography.bodyL,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  palaceItemSub: {
    ...typography.bodyS,
    color: colors.textSecondary,
    marginTop: 2,
  },
  drillBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  footerSection: {
    alignItems: 'center',
    gap: spacing.m,
    marginTop: spacing.s,
  },
  streakFooterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    backgroundColor: '#FFEDD5',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
    borderRadius: radius.pill,
  },
  streakFooterText: {
    ...typography.bodyM,
    fontWeight: '700',
    color: '#9A3412',
  },
  resetBtn: {
    padding: spacing.s,
  },
  resetText: {
    ...typography.bodyS,
    color: colors.danger,
    textDecorationLine: 'underline',
  },
});

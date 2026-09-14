import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { colors, typography, spacing, radius } from '../../theme';
import { RetentionReview } from '../../types';

export const ProgressScreen: React.FC = () => {
  const {
    profile,
    palaces,
    practiceHistory,
    retentionMemories,
    resetAllData,
    navigate,
  } = useNavigation();

  // 1. CAPACITY METRICS
  const baselineRecalled = profile.baselineScore?.recalled;
  const baselineTotal = profile.baselineScore?.total || 8;

  // Working capacity: maximum items recalled with >= 60% accuracy in practice
  let currentWorkingCapacity: number | null = null;
  if (practiceHistory.length > 0) {
    const successful = practiceHistory.filter((p) => (p.accuracy || 0) >= 60);
    if (successful.length > 0) {
      currentWorkingCapacity = Math.max(...successful.map((p) => p.totalItems));
    } else {
      currentWorkingCapacity = practiceHistory[0]?.totalItems || null;
    }
  }

  // Honest descriptive delta
  let comparisonText: string | null = null;
  if (baselineRecalled !== undefined && currentWorkingCapacity !== null) {
    const diff = currentWorkingCapacity - baselineRecalled;
    if (diff > 0) {
      comparisonText = `${diff} more items than your baseline`;
    } else if (diff === 0) {
      comparisonText = 'Matching your raw baseline capacity';
    } else {
      comparisonText = 'Building from your baseline';
    }
  }

  // 2. RETENTION LONGEVITY METRICS (1d, 3d, 7d, 14d, 30d)
  const allReviews: RetentionReview[] = [];
  (retentionMemories || []).forEach((mem) => {
    if (Array.isArray(mem.reviews)) {
      allReviews.push(...mem.reviews);
    }
  });

  const getIntervalStats = (
    day: number
  ): { tested: boolean; accuracy: number | null } => {
    const matching = allReviews.filter((r) => r.intervalDay === day);
    if (matching.length === 0) {
      return { tested: false, accuracy: null };
    }
    const sumPct = matching.reduce(
      (sum, r) => sum + (r.total > 0 ? (r.score / r.total) * 100 : 0),
      0
    );
    return { tested: true, accuracy: Math.round(sumPct / matching.length) };
  };

  const retentionIntervals = [1, 3, 7, 14, 30];

  // 3. PALACE INVENTORY STATUS
  const now = Date.now();
  const getPalaceRetentionStatus = (palaceId: string) => {
    const mem = (retentionMemories || []).find(
      (m) => m.palaceId === palaceId && m.status === 'active'
    );
    if (!mem) return 'Ready to train';
    const reviewTime = new Date(mem.nextReviewDate).getTime();
    const diffHours = Math.round((reviewTime - now) / (1000 * 3600));
    if (diffHours <= 0) return 'Next review: Due today';
    if (diffHours < 24) return 'Next review: Tomorrow';
    const days = Math.round(diffHours / 24);
    return `Next review: In ${days} days`;
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Training Data?',
      'This will erase your progress, baseline score, and workout history so you can restart as a fresh user.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Data',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer
      scrollable
      contentContainerStyle={[styles.container, { paddingBottom: 40 }]}
    >
      {/* Header */}
      <Header
        title="Progress"
        subtitle="Evidence-based capacity & retention proof"
      />

      {/* Section 1: Capacity */}
      <View style={styles.sectionHeadingWrap}>
        <Text style={styles.sectionHeading}>CAPACITY</Text>
      </View>

      <Card variant="elevated" style={styles.capacityCard}>
        <View style={styles.compareRow}>
          {/* Baseline Column */}
          <View style={styles.compareCol}>
            <Text style={styles.colLabel}>Baseline</Text>
            <Text style={styles.colValueMuted}>
              {baselineRecalled !== undefined
                ? `${baselineRecalled} / ${baselineTotal}`
                : '—'}
            </Text>
            <Text style={styles.colSubtext}>Unassisted</Text>
          </View>

          <View style={styles.dividerVertical} />

          {/* Current Working Capacity Column */}
          <View style={styles.compareCol}>
            <Text style={styles.colLabel}>Current Working Capacity</Text>
            <Text style={styles.colValueBold}>
              {currentWorkingCapacity !== null
                ? `${currentWorkingCapacity} items`
                : '—'}
            </Text>
            <Text style={styles.colSubtext}>With Memory Palace</Text>
          </View>
        </View>

        {comparisonText && (
          <>
            <View style={styles.dividerHorizontal} />
            <View style={styles.calloutRow}>
              <MaterialCommunityIcons
                name="arrow-up-circle"
                size={18}
                color={colors.palace}
                style={{ marginRight: spacing.xs }}
              />
              <Text style={styles.calloutText}>{comparisonText}</Text>
            </View>
          </>
        )}
      </Card>

      {/* Section 2: Retention Longevity */}
      <View style={styles.sectionHeadingWrap}>
        <Text style={styles.sectionHeading}>RETENTION LONGEVITY</Text>
        <Text style={styles.sectionSubHeading}>Your memory over time</Text>
      </View>

      <Card style={styles.retentionCard}>
        {retentionIntervals.map((interval, idx) => {
          const stats = getIntervalStats(interval);
          const isLast = idx === retentionIntervals.length - 1;

          return (
            <View key={interval}>
              <View style={styles.retentionRow}>
                <Text style={styles.intervalDayText}>
                  {interval} {interval === 1 ? 'DAY' : 'DAYS'}
                </Text>

                <View style={styles.intervalResultWrap}>
                  {stats.tested ? (
                    <>
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color={colors.success}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.intervalAccuracyText}>
                        {stats.accuracy}%
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.intervalUntestedDash}>—</Text>
                      <Text style={styles.intervalUntestedText}>
                        Not tested
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {!isLast && <View style={styles.intervalDivider} />}
            </View>
          );
        })}
      </Card>

      {/* Section 3: Active Palaces */}
      <View style={styles.sectionHeadingWrap}>
        <Text style={styles.sectionHeading}>ACTIVE PALACES</Text>
      </View>

      <View style={styles.palacesList}>
        {palaces.map((p) => {
          const status = getPalaceRetentionStatus(p.id);

          return (
            <Card key={p.id} style={styles.palaceCard}>
              <View style={styles.palaceRow}>
                <View style={styles.palaceIconCircle}>
                  <MaterialCommunityIcons
                    name="castle"
                    size={20}
                    color={colors.palace}
                  />
                </View>

                <View style={styles.palaceInfo}>
                  <Text style={styles.palaceName}>{p.name}</Text>
                  <Text style={styles.palaceMeta}>
                    {p.spots.length} stations · {status}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.palaceActionBtn}
                  onPress={() =>
                    navigate('practiceSession', {
                      techniqueId: 'palace',
                      level: 1,
                      itemCount: 5,
                      palaceId: p.id,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.palaceActionText}>Train</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}
      </View>

      {/* Reset Data */}
      <TouchableOpacity
        style={styles.resetBtn}
        onPress={handleReset}
        activeOpacity={0.7}
      >
        <Text style={styles.resetBtnText}>Reset All Training Data</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.l,
  },

  // Section Headings
  sectionHeadingWrap: {
    marginBottom: spacing.s,
    marginTop: spacing.m,
  },
  sectionHeading: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.palace,
    letterSpacing: 1,
  },
  sectionSubHeading: {
    ...typography.bodyS,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Capacity Card
  capacityCard: {
    backgroundColor: colors.surface,
    padding: spacing.l,
    borderRadius: radius.xl,
    marginBottom: spacing.m,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compareCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.s,
  },
  dividerVertical: {
    width: 1,
    height: '80%',
    backgroundColor: colors.border,
  },
  colLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  colValueMuted: {
    ...typography.headingXL,
    fontSize: 26,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: 2,
  },
  colValueBold: {
    ...typography.headingXL,
    fontSize: 26,
    color: colors.textPrimary,
    fontWeight: '800',
    marginBottom: 2,
  },
  colSubtext: {
    ...typography.caption,
    color: colors.textMuted,
  },
  dividerHorizontal: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.m,
  },
  calloutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutText: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.palace,
  },

  // Retention Longevity Card
  retentionCard: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: radius.xl,
    marginBottom: spacing.m,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  retentionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.m,
  },
  intervalDayText: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  intervalResultWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intervalAccuracyText: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  intervalUntestedDash: {
    ...typography.bodyM,
    color: colors.textMuted,
    marginRight: 6,
  },
  intervalUntestedText: {
    ...typography.bodyS,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  intervalDivider: {
    height: 1,
    backgroundColor: colors.border,
  },

  // Active Palaces List
  palacesList: {
    gap: spacing.s,
    marginBottom: spacing.xl,
  },
  palaceCard: {
    padding: spacing.m,
    borderRadius: radius.l,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  palaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  palaceIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
  palaceActionBtn: {
    backgroundColor: colors.palaceLight,
    paddingHorizontal: spacing.m,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  palaceActionText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.palace,
  },

  // Reset Button
  resetBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
  },
  resetBtnText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

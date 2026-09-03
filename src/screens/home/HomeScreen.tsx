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
  const { profile, techniqueProgress, navigate } = useNavigation();

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

  const getPercentage = (completedSteps: number, totalPractices: number) => {
    const stepWeight = (completedSteps / 6) * 60; // 60% weight on lessons
    const practiceWeight = Math.min(40, totalPractices * 10); // 40% weight on practices
    return Math.min(100, Math.round(stepWeight + practiceWeight));
  };

  const palacePct = getPercentage(
    techniqueProgress.palace.completedSteps,
    techniqueProgress.palace.totalPractices
  );
  const linkingPct = getPercentage(
    techniqueProgress.linking.completedSteps,
    techniqueProgress.linking.totalPractices
  );
  const pegPct = getPercentage(
    techniqueProgress.peg.completedSteps,
    techniqueProgress.peg.totalPractices
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
            <Text style={styles.techPercent}>{palacePct}%</Text>
          </View>
          <ProgressBar progress={palacePct / 100} color={colors.palace} height={8} />
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
            <Text style={styles.techPercent}>{linkingPct}%</Text>
          </View>
          <ProgressBar progress={linkingPct / 100} color={colors.linking} height={8} />
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
            <Text style={styles.techPercent}>{pegPct}%</Text>
          </View>
          <ProgressBar progress={pegPct / 100} color={colors.peg} height={8} />
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

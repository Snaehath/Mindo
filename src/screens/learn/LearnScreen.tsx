import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { MasteryBadge } from '../../components/Badge';
import { StepBar } from '../../components/ProgressBar';
import { colors, typography, spacing, radius } from '../../theme';
import { techniqueModules } from '../../data/lessonsData';
import { TechniqueType } from '../../types';

export const LearnScreen: React.FC = () => {
  const { techniqueProgress, navigate } = useNavigation();

  const techniques: TechniqueType[] = ['palace', 'linking', 'peg'];

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <Header
        title="Memory Techniques"
        subtitle="Master the 3 pillars of human mnemonics"
      />

      <View style={styles.list}>
        {techniques.map((techId) => {
          const mod = techniqueModules[techId];
          const prog = techniqueProgress[techId];
          const completedSteps = prog.completedSteps;

          return (
            <Card
              key={techId}
              style={styles.techCard}
              onPress={() => navigate('techniqueDetail', { techniqueId: techId })}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: `${mod.badgeColor}15` }]}>
                  <MaterialCommunityIcons
                    name={mod.icon as any}
                    size={28}
                    color={mod.badgeColor}
                  />
                </View>
                <MasteryBadge level={prog.masteryLevel} />
              </View>

              <Text style={styles.techTitle}>{mod.title}</Text>
              <Text style={styles.techTagline}>{mod.tagline}</Text>
              <Text style={styles.techDesc}>{mod.description}</Text>

              <View style={styles.progressSection}>
                <View style={styles.stepInfoRow}>
                  <Text style={styles.stepLabel}>
                    {completedSteps >= 6 ? 'All 6 Steps Completed' : `Step ${completedSteps} of 6`}
                  </Text>
                  <Text style={[styles.stepActionText, { color: mod.badgeColor }]}>
                    {completedSteps === 0 ? 'Start' : completedSteps >= 6 ? 'Review' : 'Continue'} →
                  </Text>
                </View>
                <StepBar
                  currentStep={Math.max(1, completedSteps)}
                  totalSteps={6}
                  color={mod.badgeColor}
                />
              </View>
            </Card>
          );
        })}
      </View>

      {/* Memory Palace Builder Shortcut */}
      <Card
        variant="tinted"
        tintColor={colors.palaceLight}
        style={styles.palaceBuilderCard}
        onPress={() => navigate('palaceBuilder')}
      >
        <View style={styles.palaceBuilderRow}>
          <View style={styles.builderIconBox}>
            <MaterialCommunityIcons name="home-plus" size={24} color={colors.palace} />
          </View>
          <View style={styles.builderTextBox}>
            <Text style={styles.builderTitle}>Build a Custom Palace</Text>
            <Text style={styles.builderSub}>
              Map your home, workplace, or favorite park with custom spots.
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.palace} />
        </View>
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.m,
    paddingBottom: spacing.xxl,
  },
  list: {
    gap: spacing.l,
    marginBottom: spacing.xl,
  },
  techCard: {
    padding: spacing.l,
    borderRadius: radius.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  techTitle: {
    ...typography.headingL,
    fontSize: 20,
    marginBottom: 2,
  },
  techTagline: {
    ...typography.bodyS,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.s,
  },
  techDesc: {
    ...typography.bodyM,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.l,
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.m,
  },
  stepInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  stepLabel: {
    ...typography.bodyS,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  stepActionText: {
    ...typography.bodyS,
    fontWeight: '700',
  },
  palaceBuilderCard: {
    borderRadius: radius.l,
    padding: spacing.l,
  },
  palaceBuilderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  builderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  builderTextBox: {
    flex: 1,
  },
  builderTitle: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.palace,
  },
  builderSub: {
    ...typography.bodyS,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

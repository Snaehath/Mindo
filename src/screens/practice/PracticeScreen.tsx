import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { colors, typography, spacing, radius } from '../../theme';
import { TechniqueType } from '../../types';

export const PracticeScreen: React.FC = () => {
  const { navigate, palaces, techniqueProgress } = useNavigation();

  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueType>('palace');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedPalaceId, setSelectedPalaceId] = useState<string>(
    palaces[0]?.id || 'palace_home_default'
  );

  const levels = [
    { level: 1, count: 5, label: '5 items', desc: 'Getting started' },
    { level: 2, count: 10, label: '10 items', desc: 'Building skill' },
    { level: 3, count: 15, label: '15 items', desc: 'Strong recall' },
    { level: 4, count: 20, label: '20 items', desc: 'Advanced challenge' },
  ];

  const { practiceHistory } = useNavigation();

  // Performance-based unlocking: >= 80% recall to unlock next challenge
  const isLevelUnlocked = (lvl: number): boolean => {
    if (lvl === 1) return true;
    const techAttempts = practiceHistory.filter((p) => p.techniqueId === selectedTechnique);
    if (lvl === 2) {
      return techAttempts.some((p) => p.level === 1 && p.accuracy >= 80) || techAttempts.length >= 1;
    }
    if (lvl === 3) {
      return techAttempts.some((p) => p.level === 2 && p.accuracy >= 80);
    }
    if (lvl === 4) {
      return techAttempts.some((p) => p.level === 3 && p.accuracy >= 80);
    }
    return false;
  };

  const isLevelComfortable = (lvl: number): boolean => {
    return practiceHistory.some(
      (p) => p.techniqueId === selectedTechnique && p.level === lvl && p.accuracy >= 80
    );
  };

  const techniques: Array<{
    id: TechniqueType;
    name: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
    lightColor: string;
    desc: string;
  }> = [
    {
      id: 'palace',
      name: 'Memory Palace',
      icon: 'castle',
      color: colors.palace,
      lightColor: colors.palaceLight,
      desc: 'Anchor items to sequential rooms & spots.',
    },
    {
      id: 'linking',
      name: 'Story Linker',
      icon: 'link-variant',
      color: colors.linking,
      lightColor: colors.linkingLight,
      desc: 'Chain bizarre action cause-and-effects.',
    },
    {
      id: 'peg',
      name: 'Peg Master',
      icon: 'format-list-numbered',
      color: colors.peg,
      lightColor: colors.pegLight,
      desc: 'Hang items directly onto numbered rhymes.',
    },
  ];

  const handleStartWorkout = () => {
    navigate('practiceSession', {
      techniqueId: selectedTechnique,
      level: selectedLevel,
      itemCount: levels.find((l) => l.level === selectedLevel)?.count || 5,
      palaceId: selectedPalaceId,
    });
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <Header
        title="Memory Gym"
        subtitle="Pick your technique and workout intensity"
      />

      {/* 1. Technique Selector */}
      <Text style={styles.sectionHeading}>1. Choose Technique</Text>
      <View style={styles.techniqueList}>
        {techniques.map((t) => {
          const isSelected = selectedTechnique === t.id;
          return (
            <Card
              key={t.id}
              style={[
                styles.techniqueCard,
                isSelected && { borderColor: t.color, borderWidth: 2 },
              ]}
              onPress={() => setSelectedTechnique(t.id)}
            >
              <View style={styles.techniqueCardRow}>
                <View style={[styles.techIconBox, { backgroundColor: t.lightColor }]}>
                  <MaterialCommunityIcons name={t.icon} size={26} color={t.color} />
                </View>
                <View style={styles.techTextWrap}>
                  <Text style={styles.techTitle}>{t.name}</Text>
                  <Text style={styles.techDesc}>{t.desc}</Text>
                </View>
                {isSelected && (
                  <MaterialCommunityIcons name="check-circle" size={24} color={t.color} />
                )}
              </View>
            </Card>
          );
        })}
      </View>

      {/* 2. Palace Selector (Only if Palace is selected) */}
      {selectedTechnique === 'palace' && (
        <View style={styles.palaceSelectorBlock}>
          <Text style={styles.sectionHeading}>Palace Location</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.palaceScroll}>
            {palaces.map((p) => {
              const isChosen = selectedPalaceId === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setSelectedPalaceId(p.id)}
                  style={[styles.palaceChip, isChosen && styles.palaceChipActive]}
                >
                  <MaterialCommunityIcons
                    name={p.iconName as any || 'home'}
                    size={18}
                    color={isChosen ? colors.palace : colors.textSecondary}
                  />
                  <Text style={[styles.palaceChipText, isChosen && styles.palaceChipTextActive]}>
                    {p.name} ({p.spots.length} spots)
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 2. Challenge Size */}
      <Text style={styles.sectionHeading}>2. Challenge Size</Text>
      <View style={styles.levelGrid}>
        {levels.map((lvl) => {
          const isSelected = selectedLevel === lvl.level;
          const unlocked = isLevelUnlocked(lvl.level);
          const comfortable = isLevelComfortable(lvl.level);

          return (
            <TouchableOpacity
              key={lvl.level}
              onPress={() => {
                if (unlocked) {
                  setSelectedLevel(lvl.level);
                }
              }}
              activeOpacity={unlocked ? 0.8 : 1}
              style={[
                styles.levelCard,
                isSelected && styles.levelCardSelected,
                !unlocked && styles.levelCardLocked,
              ]}
            >
              <View style={styles.levelTop}>
                <View style={styles.levelTitleRow}>
                  <Text style={[styles.levelLabel, isSelected && styles.levelLabelSelected]}>
                    {lvl.label}
                  </Text>
                  {comfortable ? (
                    <View style={styles.completedBadge}>
                      <MaterialCommunityIcons name="check" size={13} color={colors.success} />
                      <Text style={styles.completedBadgeText}>Comfortable</Text>
                    </View>
                  ) : unlocked ? (
                    <View style={styles.readyBadge}>
                      <Text style={styles.readyBadgeText}>→ Ready to try</Text>
                    </View>
                  ) : (
                    <View style={styles.lockedBadge}>
                      <MaterialCommunityIcons name="lock-outline" size={12} color={colors.textMuted} />
                      <Text style={styles.lockedBadgeText}>Keep practicing</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={[styles.levelDesc, isSelected && styles.levelDescSelected]}>
                {lvl.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Start Button */}
      <View style={styles.startBtnWrap}>
        <Button
          label={`Start Workout (${levels.find((l) => l.level === selectedLevel)?.label}) →`}
          onPress={handleStartWorkout}
          variant={
            selectedTechnique === 'palace'
              ? 'palace'
              : selectedTechnique === 'linking'
              ? 'linking'
              : 'peg'
          }
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.m,
    paddingBottom: spacing.xxl,
  },
  sectionHeading: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: spacing.m,
    marginBottom: spacing.m,
  },
  techniqueList: {
    gap: spacing.s,
    marginBottom: spacing.l,
  },
  techniqueCard: {
    padding: spacing.m,
    borderRadius: radius.l,
  },
  techniqueCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  techIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  techTextWrap: {
    flex: 1,
  },
  techTitle: {
    ...typography.bodyL,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  techDesc: {
    ...typography.bodyS,
    color: colors.textSecondary,
    marginTop: 2,
  },
  palaceSelectorBlock: {
    marginBottom: spacing.l,
  },
  palaceScroll: {
    gap: spacing.s,
  },
  palaceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  palaceChipActive: {
    backgroundColor: colors.palaceLight,
    borderColor: colors.palace,
  },
  palaceChipText: {
    ...typography.bodyS,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  palaceChipTextActive: {
    color: colors.palace,
  },
  levelGrid: {
    gap: spacing.s,
    marginBottom: spacing.xl,
  },
  levelCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.m,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  levelCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
  },
  levelCardLocked: {
    opacity: 0.6,
    backgroundColor: colors.surfaceMuted,
  },
  levelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.successLight,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
  },
  completedBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.success,
    fontWeight: '700',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surface,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lockedBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  readyBadge: {
    backgroundColor: colors.palaceLight,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
  },
  readyBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.palace,
    fontWeight: '700',
  },
  levelLabel: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.textPrimary,
  },
  levelLabelSelected: {
    color: colors.primary,
  },
  countBadge: {
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 2,
    paddingHorizontal: spacing.s,
    borderRadius: radius.pill,
  },
  countBadgeSelected: {
    backgroundColor: colors.primary,
  },
  countText: {
    ...typography.bodyS,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  countTextSelected: {
    color: colors.textInverse,
  },
  levelDesc: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },
  levelDescSelected: {
    color: colors.textPrimary,
  },
  startBtnWrap: {
    marginTop: spacing.s,
  },
});

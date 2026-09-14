import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, typography, spacing, radius } from '../../theme';
import { CAPACITY_LEVELS, isCapacityLevelUnlocked } from '../../utils/capacity';

export const PracticeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    navigate,
    palaces,
    practiceHistory,
    profile,
  } = useNavigation();

  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedPalaceId, setSelectedPalaceId] = useState<string>(
    palaces[0]?.id || 'palace_home_default'
  );
  const [recallMode, setRecallMode] = useState<'choice' | 'type'>('choice');

  // Secondary techniques unlock rule:
  // Unlocked after first palace workout is complete
  const areSecondaryUnlocked =
    profile.lifecycleState === 'FIRST_WORKOUT_COMPLETE' ||
    profile.lifecycleState === 'ACTIVE_USER' ||
    (practiceHistory || []).some((p) => p.techniqueId === 'palace');

  const selectedLevelData =
    CAPACITY_LEVELS.find((l) => l.level === selectedLevel) || CAPACITY_LEVELS[0];

  const handleStartSession = () => {
    navigate('practiceSession', {
      techniqueId: 'palace',
      level: selectedLevel,
      itemCount: selectedLevelData.count,
      palaceId: selectedPalaceId,
      recallMode,
    });
  };

  return (
    <ScreenContainer
      scrollable
      contentContainerStyle={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 24) + 20 },
      ]}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER
         ───────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Train</Text>
        <Text style={styles.headerSubtitle}>Your cognitive memory library</Text>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          2. PRIMARY HERO: MEMORY PALACE GYM
         ───────────────────────────────────────────────────────────── */}
      <Card variant="elevated" style={styles.gymHeroCard}>
        <View style={styles.gymHeaderRow}>
          <View style={styles.gymBadge}>
            <MaterialCommunityIcons name="castle" size={16} color={colors.palace} />
            <Text style={styles.gymBadgeText}>MEMORY PALACE GYM</Text>
          </View>
        </View>

        <Text style={styles.gymTitle}>Build your capacity with spatial memory</Text>

        {/* Capacity Ladder (5 -> 10 -> 15 -> 20) */}
        <Text style={styles.fieldLabel}>Capacity Level</Text>
        <View style={styles.capacityRow}>
          {CAPACITY_LEVELS.map((cap) => {
            const isUnlocked = isCapacityLevelUnlocked(cap.level, practiceHistory);
            const isSelected = selectedLevel === cap.level;

            return (
              <TouchableOpacity
                key={cap.level}
                onPress={() => {
                  if (isUnlocked) {
                    setSelectedLevel(cap.level);
                  }
                }}
                activeOpacity={isUnlocked ? 0.7 : 1}
                style={[
                  styles.capacityPill,
                  isSelected && styles.capacityPillSelected,
                  !isUnlocked && styles.capacityPillLocked,
                ]}
              >
                <View style={styles.pillContent}>
                  {isSelected && (
                    <Text style={styles.activeDot}>● </Text>
                  )}
                  {!isUnlocked && (
                    <MaterialCommunityIcons
                      name="lock"
                      size={12}
                      color={colors.textMuted}
                      style={{ marginRight: 2 }}
                    />
                  )}
                  {isUnlocked && !isSelected && cap.level > 1 && (
                    <MaterialCommunityIcons
                      name="lock-open-variant"
                      size={12}
                      color={colors.palace}
                      style={{ marginRight: 2 }}
                    />
                  )}
                  <Text
                    style={[
                      styles.capacityPillText,
                      isSelected && styles.capacityPillTextSelected,
                      !isUnlocked && styles.capacityPillTextLocked,
                    ]}
                  >
                    {cap.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.capacityHintText}>
          {selectedLevelData.count} items · {selectedLevelData.desc}
          {selectedLevel === 2 && ' (unlocked at ≥80% on 5)'}
          {selectedLevel === 3 && ' (unlocked at ≥80% on 10)'}
          {selectedLevel === 4 && ' (unlocked at ≥80% on 15)'}
        </Text>

        {/* Palace Location Selector */}
        <Text style={styles.fieldLabel}>Palace Location</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.palaceScroll}
        >
          {palaces.map((p) => {
            const isChosen = selectedPalaceId === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => setSelectedPalaceId(p.id)}
                activeOpacity={0.7}
                style={[styles.palaceChip, isChosen && styles.palaceChipActive]}
              >
                <MaterialCommunityIcons
                  name="castle"
                  size={16}
                  color={isChosen ? colors.palace : colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.palaceChipText,
                    isChosen && styles.palaceChipTextActive,
                  ]}
                >
                  {p.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Mode Selector (Options vs Type Pro) */}
        <Text style={styles.fieldLabel}>Recall Mode</Text>
        <View style={styles.modeToggleRow}>
          <TouchableOpacity
            style={[styles.modeBtn, recallMode === 'choice' && styles.modeBtnActive]}
            onPress={() => setRecallMode('choice')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.modeBtnText,
                recallMode === 'choice' && styles.modeBtnTextActive,
              ]}
            >
              Options
            </Text>
            <Text style={styles.modeBtnSub}>Assisted</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, recallMode === 'type' && styles.modeBtnActive]}
            onPress={() => setRecallMode('type')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.modeBtnText,
                recallMode === 'type' && styles.modeBtnTextActive,
              ]}
            >
              Type Pro
            </Text>
            <Text style={styles.modeBtnSub}>Free Recall</Text>
          </TouchableOpacity>
        </View>

        {/* Primary CTA */}
        <View style={styles.gymActionWrap}>
          <Button
            label="Start Session →"
            onPress={handleStartSession}
            variant="palace"
            size="large"
          />
        </View>
      </Card>

      {/* ─────────────────────────────────────────────────────────────
          3. CUSTOM PALACES CARD
         ───────────────────────────────────────────────────────────── */}
      <Card variant="tinted" tintColor={colors.palaceLight} style={styles.customPalaceCard}>
        <View style={styles.customHeaderRow}>
          <MaterialCommunityIcons name="home-plus" size={22} color={colors.palace} />
          <Text style={styles.customCardTitle}>CUSTOM PALACES</Text>
        </View>
        <Text style={styles.customCardBody}>
          Build a palace from a place you know well: your apartment, campus, or morning walk.
        </Text>
        <Button
          label="Create New Palace →"
          onPress={() => navigate('palaceBuilder')}
          variant="outline"
          size="normal"
          style={{ alignSelf: 'flex-start', marginTop: spacing.s }}
        />
      </Card>

      {/* ─────────────────────────────────────────────────────────────
          4. OTHER TECHNIQUES (Secondary Section)
         ───────────────────────────────────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Other Techniques</Text>
      </View>

      <View style={styles.secondaryList}>
        {/* Story Linking */}
        <Card
          style={[styles.secondaryCard, !areSecondaryUnlocked && styles.secondaryCardLocked]}
          onPress={() => {
            if (areSecondaryUnlocked) {
              navigate('techniqueDetail', { techniqueId: 'linking' });
            }
          }}
        >
          <View style={styles.secondaryRow}>
            <View
              style={[
                styles.secondaryIconBox,
                { backgroundColor: areSecondaryUnlocked ? colors.linkingLight : colors.surfaceMuted },
              ]}
            >
              <MaterialCommunityIcons
                name={areSecondaryUnlocked ? 'link-variant' : 'lock-outline'}
                size={22}
                color={areSecondaryUnlocked ? colors.linking : colors.textMuted}
              />
            </View>

            <View style={styles.secondaryTextBox}>
              <View style={styles.secondaryTitleRow}>
                <Text style={styles.secondaryTitle}>Story Linking</Text>
                {!areSecondaryUnlocked && (
                  <Text style={styles.lockedBadge}>🔒 Locked</Text>
                )}
              </View>
              <Text style={styles.secondaryDesc}>
                {areSecondaryUnlocked
                  ? 'Narrative chain exercises'
                  : 'Complete your first Memory Palace workout to unlock'}
              </Text>
            </View>

            {areSecondaryUnlocked && (
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
            )}
          </View>
        </Card>

        {/* Peg System */}
        <Card
          style={[styles.secondaryCard, !areSecondaryUnlocked && styles.secondaryCardLocked]}
          onPress={() => {
            if (areSecondaryUnlocked) {
              navigate('techniqueDetail', { techniqueId: 'peg' });
            }
          }}
        >
          <View style={styles.secondaryRow}>
            <View
              style={[
                styles.secondaryIconBox,
                { backgroundColor: areSecondaryUnlocked ? colors.pegLight : colors.surfaceMuted },
              ]}
            >
              <MaterialCommunityIcons
                name={areSecondaryUnlocked ? 'format-list-numbered' : 'lock-outline'}
                size={22}
                color={areSecondaryUnlocked ? colors.peg : colors.textMuted}
              />
            </View>

            <View style={styles.secondaryTextBox}>
              <View style={styles.secondaryTitleRow}>
                <Text style={styles.secondaryTitle}>Peg System</Text>
                {!areSecondaryUnlocked && (
                  <Text style={styles.lockedBadge}>🔒 Locked</Text>
                )}
              </View>
              <Text style={styles.secondaryDesc}>
                {areSecondaryUnlocked
                  ? 'Number-rhyme anchors (1-Bun, 2-Shoe)'
                  : 'Complete your first Memory Palace workout to unlock'}
              </Text>
            </View>

            {areSecondaryUnlocked && (
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
            )}
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.l,
  },
  header: {
    marginBottom: spacing.l,
  },
  headerTitle: {
    ...typography.headingXL,
    fontSize: 28,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  headerSubtitle: {
    ...typography.bodyM,
    color: colors.textSecondary,
  },

  // Hero Card
  gymHeroCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing.l,
    borderWidth: 2,
    borderColor: colors.palace,
  },
  gymHeaderRow: {
    flexDirection: 'row',
    marginBottom: spacing.s,
  },
  gymBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.palaceLight,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: radius.pill,
    gap: 6,
  },
  gymBadgeText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.palace,
    letterSpacing: 0.8,
  },
  gymTitle: {
    ...typography.headingL,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.l,
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.s,
    letterSpacing: 0.5,
  },

  // Capacity Pills
  capacityRow: {
    flexDirection: 'row',
    gap: spacing.s,
    marginBottom: spacing.xs,
  },
  capacityPill: {
    flex: 1,
    paddingVertical: spacing.m,
    borderRadius: radius.l,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  capacityPillSelected: {
    backgroundColor: colors.palaceLight,
    borderColor: colors.palace,
  },
  capacityPillLocked: {
    opacity: 0.5,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    color: colors.palace,
    fontSize: 12,
  },
  capacityPillText: {
    ...typography.headingM,
    fontSize: 15,
    color: colors.textPrimary,
  },
  capacityPillTextSelected: {
    color: colors.palace,
    fontWeight: '800',
  },
  capacityPillTextLocked: {
    color: colors.textMuted,
  },
  capacityHintText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.l,
  },

  // Palace Selector
  palaceScroll: {
    flexDirection: 'row',
    gap: spacing.s,
    paddingBottom: spacing.l,
  },
  palaceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  palaceChipActive: {
    backgroundColor: colors.palaceLight,
    borderColor: colors.palace,
  },
  palaceChipText: {
    ...typography.bodyM,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  palaceChipTextActive: {
    color: colors.palace,
    fontWeight: '700',
  },

  // Mode Selector
  modeToggleRow: {
    flexDirection: 'row',
    gap: spacing.m,
    marginBottom: spacing.xl,
  },
  modeBtn: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderRadius: radius.l,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  modeBtnActive: {
    backgroundColor: colors.palaceLight,
    borderColor: colors.palace,
  },
  modeBtnText: {
    ...typography.headingM,
    fontSize: 15,
    color: colors.textPrimary,
  },
  modeBtnTextActive: {
    color: colors.palace,
    fontWeight: '700',
  },
  modeBtnSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  gymActionWrap: {
    width: '100%',
  },

  // Custom Palace Card
  customPalaceCard: {
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.xl,
  },
  customHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    marginBottom: spacing.xs,
  },
  customCardTitle: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.palace,
  },
  customCardBody: {
    ...typography.bodyM,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.s,
  },

  // Secondary Techniques
  sectionHeader: {
    marginBottom: spacing.m,
  },
  sectionTitle: {
    ...typography.headingM,
    fontSize: 18,
    color: colors.textPrimary,
  },
  secondaryList: {
    gap: spacing.s,
  },
  secondaryCard: {
    padding: spacing.m,
    borderRadius: radius.l,
  },
  secondaryCardLocked: {
    opacity: 0.6,
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  secondaryTextBox: {
    flex: 1,
  },
  secondaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    marginBottom: 2,
  },
  secondaryTitle: {
    ...typography.headingM,
    fontSize: 16,
    color: colors.textPrimary,
  },
  lockedBadge: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  secondaryDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../theme';

interface MemoryCardProps {
  emoji: string;
  title: string;
  locationOrPeg?: string;
  associationHint?: string;
  style?: StyleProp<ViewStyle>;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  emoji,
  title,
  locationOrPeg,
  associationHint,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      {locationOrPeg && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{locationOrPeg}</Text>
        </View>
      )}

      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>

      {associationHint && (
        <View style={styles.hintBox}>
          <Text style={styles.hintLabel}>Mental Picture 🧠</Text>
          <Text style={styles.hintText}>{associationHint}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.elevated,
  },
  badge: {
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 4,
    paddingHorizontal: spacing.m,
    borderRadius: radius.pill,
    marginBottom: spacing.m,
  },
  badgeText: {
    ...typography.bodyS,
    fontWeight: '600',
    color: colors.primary,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.m,
  },
  title: {
    ...typography.headingL,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  hintBox: {
    marginTop: spacing.m,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.m,
    padding: spacing.m,
    width: '100%',
  },
  hintLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 4,
  },
  hintText: {
    ...typography.bodyM,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, typography, spacing } from '../theme';
import { MasteryLevel } from '../types';

interface BadgeProps {
  label: string;
  variant?: 'neutral' | 'success' | 'palace' | 'linking' | 'peg' | 'warning';
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  size?: 'small' | 'normal';
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  iconName,
  size = 'small',
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.successLight, text: colors.success, icon: colors.success };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warning, icon: colors.warning };
      case 'palace':
        return { bg: colors.palaceLight, text: colors.palace, icon: colors.palace };
      case 'linking':
        return { bg: colors.linkingLight, text: colors.linking, icon: colors.linking };
      case 'peg':
        return { bg: colors.pegLight, text: colors.peg, icon: colors.peg };
      case 'neutral':
      default:
        return { bg: colors.surfaceMuted, text: colors.textSecondary, icon: colors.textSecondary };
    }
  };

  const { bg, text, icon } = getColors();

  return (
    <View
      style={[
        styles.base,
        size === 'small' ? styles.sizeSmall : styles.sizeNormal,
        { backgroundColor: bg },
        style,
      ]}
    >
      {iconName && (
        <MaterialCommunityIcons
          name={iconName}
          size={size === 'small' ? 12 : 14}
          color={icon}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          size === 'small' ? styles.textSmall : styles.textNormal,
          { color: text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

export const MasteryBadge: React.FC<{ level: MasteryLevel; style?: ViewStyle }> = ({
  level,
  style,
}) => {
  const meta: Record<
    MasteryLevel,
    { label: string; variant: BadgeProps['variant']; icon: keyof typeof MaterialCommunityIcons.glyphMap }
  > = {
    beginner: { label: 'Beginner', variant: 'neutral', icon: 'seed-outline' },
    learner: { label: 'Learner', variant: 'warning', icon: 'school-outline' },
    skilled: { label: 'Skilled', variant: 'palace', icon: 'shield-star-outline' },
    advanced: { label: 'Advanced', variant: 'linking', icon: 'star-circle-outline' },
    master: { label: 'Master', variant: 'success', icon: 'trophy-outline' },
  };

  const item = meta[level] || meta.beginner;

  return (
    <Badge
      label={item.label}
      variant={item.variant}
      iconName={item.icon}
      size="normal"
      style={style}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
  },
  sizeSmall: {
    paddingVertical: 3,
    paddingHorizontal: spacing.s,
  },
  sizeNormal: {
    paddingVertical: 4,
    paddingHorizontal: spacing.m,
  },
  icon: {
    marginRight: 4,
  },
  textSmall: {
    ...typography.caption,
  },
  textNormal: {
    ...typography.bodyS,
    fontWeight: '600',
  },
});

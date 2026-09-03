import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  StyleProp,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'palace' | 'linking' | 'peg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconRight?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  size?: 'normal' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  iconName,
  iconRight = false,
  disabled = false,
  loading = false,
  style,
  textStyle,
  size = 'large',
}) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'ghost':
        return styles.ghostContainer;
      case 'palace':
        return styles.palaceContainer;
      case 'linking':
        return styles.linkingContainer;
      case 'peg':
        return styles.pegContainer;
      case 'primary':
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
      case 'palace':
      case 'linking':
      case 'peg':
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  const getIconColor = (): string => {
    switch (variant) {
      case 'secondary':
        return colors.textPrimary;
      case 'outline':
      case 'ghost':
        return colors.textPrimary;
      default:
        return colors.textInverse;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        size === 'large' ? styles.sizeLarge : styles.sizeNormal,
        getContainerStyle(),
        disabled && styles.disabledContainer,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextStyle().color || colors.textInverse} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {iconName && !iconRight && (
            <MaterialCommunityIcons
              name={iconName}
              size={20}
              color={getIconColor()}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              size === 'large' ? styles.textLarge : styles.textNormal,
              getTextStyle(),
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {label}
          </Text>
          {iconName && iconRight && (
            <MaterialCommunityIcons
              name={iconName}
              size={20}
              color={getIconColor()}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.l,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeNormal: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
  },
  sizeLarge: {
    paddingVertical: 15,
    paddingHorizontal: spacing.xl,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  secondaryContainer: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  palaceContainer: {
    backgroundColor: colors.palace,
  },
  linkingContainer: {
    backgroundColor: colors.linking,
  },
  pegContainer: {
    backgroundColor: colors.peg,
  },
  disabledContainer: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  textNormal: {
    ...typography.bodyM,
    fontWeight: '600',
  },
  textLarge: {
    ...typography.bodyL,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.textInverse,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  outlineText: {
    color: colors.primary,
  },
  ghostText: {
    color: colors.textSecondary,
  },
  disabledText: {
    color: colors.textMuted,
  },
  iconLeft: {
    marginRight: spacing.s,
  },
  iconRight: {
    marginLeft: spacing.s,
  },
});

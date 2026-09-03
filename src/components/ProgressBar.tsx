import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius } from '../theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  backgroundColor?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = colors.primary,
  backgroundColor = colors.surfaceMuted,
  height = 8,
  style,
}) => {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.track, { backgroundColor, height }, style]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            width: `${clamped * 100}%`,
            height,
          },
        ]}
      />
    </View>
  );
};

interface StepBarProps {
  currentStep: number; // 1-indexed
  totalSteps: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const StepBar: React.FC<StepBarProps> = ({
  currentStep,
  totalSteps,
  color = colors.primary,
  style,
}) => {
  return (
    <View style={[styles.stepRow, style]}>
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const isCompleted = idx + 1 <= currentStep;
        return (
          <View
            key={idx}
            style={[
              styles.stepDot,
              {
                backgroundColor: isCompleted ? color : colors.surfaceMuted,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radius.pill,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    flex: 1,
    height: 4,
    borderRadius: radius.pill,
  },
});

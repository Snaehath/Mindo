import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../theme';

interface BottomNavProps {
  activeTab: 'home' | 'learn' | 'practice' | 'progress';
  onSelectTab: (tab: 'home' | 'learn' | 'practice' | 'progress') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const insets = useSafeAreaInsets();

  const tabs: Array<{
    id: 'home' | 'learn' | 'practice' | 'progress';
    label: string;
    iconActive: keyof typeof MaterialCommunityIcons.glyphMap;
    iconInactive: keyof typeof MaterialCommunityIcons.glyphMap;
  }> = [
    {
      id: 'home',
      label: 'Home',
      iconActive: 'home',
      iconInactive: 'home-outline',
    },
    {
      id: 'learn',
      label: 'Learn',
      iconActive: 'book-open-page-variant',
      iconInactive: 'book-open-page-variant-outline',
    },
    {
      id: 'practice',
      label: 'Practice',
      iconActive: 'dumbbell',
      iconInactive: 'dumbbell',
    },
    {
      id: 'progress',
      label: 'Progress',
      iconActive: 'chart-line',
      iconInactive: 'chart-line',
    },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onSelectTab(tab.id)}
              activeOpacity={0.7}
              style={styles.tabItem}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <MaterialCommunityIcons
                  name={isActive ? tab.iconActive : tab.iconInactive}
                  size={24}
                  color={isActive ? colors.primary : colors.textMuted}
                />
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  iconWrapActive: {
    backgroundColor: colors.surfaceMuted,
  },
  label: {
    ...typography.bodyS,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});

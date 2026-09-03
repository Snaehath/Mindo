export const colors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  surfaceActive: '#E2E8F0',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  primary: '#1E293B',
  primaryHover: '#0F172A',
  primaryLight: '#F1F5F9',

  accent: '#3B82F6',
  accentLight: '#EFF6FF',
  accentDark: '#1D4ED8',

  palace: '#4F46E5',
  palaceLight: '#EEF2FF',
  palaceBorder: '#C7D2FE',

  linking: '#7C3AED',
  linkingLight: '#F5F3FF',
  linkingBorder: '#DDD6FE',

  peg: '#0D9488',
  pegLight: '#F0FDFA',
  pegBorder: '#99F6E4',

  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',

  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  divider: '#F1F5F9',
};

export const typography = {
  headingXL: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  headingL: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  headingM: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  bodyL: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  bodyM: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  bodyS: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    color: colors.textMuted,
  },
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const radius = {
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  pill: 999,
};

export const shadows = {
  small: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
};

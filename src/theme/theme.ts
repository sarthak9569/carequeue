export const colors = {
  primary: '#0f2744',       // Sanctuary Navy
  accent: '#0ea5a0',        // Sanctuary Teal
  success: '#10b981',       // Green
  warning: '#f59e0b',       // Amber
  danger: '#ef4444',        // Red
  background: '#f1f5f9',    // Soft Background
  surface: '#ffffff',       // White
  card: '#ffffff',
  text: '#0f172a',          // Darker Text
  textSecondary: '#64748b', // Medium Gray
  border: '#e2e8f0',        // Border
  muted: '#94a3b8',
  lightAccent: 'rgba(14, 165, 160, 0.1)',
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
};

export const borderRadius = {
  xs: 6,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  round: 9999,
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  medium: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
  },
  accent: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  }
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
};

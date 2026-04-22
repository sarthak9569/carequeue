export const colors = {
  primary: '#1e293b',       // Deep Slate (Professional & Trustworthy)
  accent: '#0ea5e9',        // Modern Sky Blue (Clinical & Fresh)
  success: '#10b981',       // Emerald Green
  warning: '#f59e0b',       // Amber
  danger: '#ef4444',        // Rose Red
  background: '#f8fafc',    // Ultra Soft Slate (Modern Background)
  surface: '#ffffff',       // Pure White
  card: '#ffffff',
  text: '#0f172a',          // Slate 900
  textSecondary: '#475569', // Slate 600
  border: '#e2e8f0',        // Slate 200
  muted: '#94a3b8',         // Slate 400
  lightAccent: 'rgba(14, 165, 233, 0.08)',
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  xs: 6,
  s: 10,
  m: 14,
  l: 20,
  xl: 28,
  round: 9999,
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  premium: {
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.12,
    shadowRadius: 25,
    elevation: 10,
  },
  accent: {
    shadowColor: '#0ea5e9',
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

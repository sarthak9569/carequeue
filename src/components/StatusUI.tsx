import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { colors, spacing, borderRadius } from '../theme/theme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'info' }) => {
  const getStyle = () => {
    switch (variant) {
      case 'success': return { bg: '#dcfce7', text: colors.success };
      case 'warning': return { bg: '#fef3c7', text: colors.warning };
      case 'danger': return { bg: '#fee2e2', text: colors.danger };
      default: return { bg: '#e0f2fe', text: colors.accent };
    }
  };

  const style = getStyle();

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Typography variant="caption" weight="600" color={style.text}>
        {label}
      </Typography>
    </View>
  );
};

export const LiveIndicator: React.FC = () => {
  return (
    <View style={styles.liveContainer}>
      <View style={styles.dot} />
      <Typography variant="caption" weight="600" color={colors.success} style={{ marginLeft: 4 }}>
        LIVE
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
});

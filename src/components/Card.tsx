import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'elevated', 
  style, 
  ...props 
}) => {
  return (
    <View style={[styles.card, styles[variant], style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {
    backgroundColor: colors.background,
  },
});

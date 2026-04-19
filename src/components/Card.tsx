import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat' | 'premium' | 'danger';
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'elevated', 
  gradient = false,
  style, 
  ...props 
}) => {
  if (variant === 'premium' || gradient) {
    return (
      <LinearGradient
        colors={variant === 'premium' ? [colors.primary, '#1a3a5f'] : [colors.surface, '#f8fafc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, shadows.medium, style]}
        {...props}
      >
        {children}
      </LinearGradient>
    );
  }

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
    ...shadows.soft,
  },
  premium: {
    ...shadows.medium,
  },
  danger: {
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: '#fef2f2',
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {
    backgroundColor: colors.background,
  },
});

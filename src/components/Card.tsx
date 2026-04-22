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
        colors={variant === 'premium' ? [colors.primary, '#334155'] : ['#ffffff', '#f1f5f9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, variant === 'premium' ? shadows.premium : shadows.soft, style]}
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
    borderRadius: borderRadius.l,
    padding: spacing.l,
    marginBottom: spacing.m,
  },
  elevated: {
    ...shadows.medium,
  },
  premium: {
    ...shadows.premium,
  },
  danger: {
    borderWidth: 1.5,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  flat: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
});

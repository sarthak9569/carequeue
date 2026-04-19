import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { colors, spacing, borderRadius } from '../theme/theme';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Typography variant="caption" weight="600" color={colors.muted} style={styles.label}>
          {label.toUpperCase()}
        </Typography>
      )}
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={colors.muted} 
            style={styles.icon} 
          />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.muted}
          {...props}
        />
      </View>
      {error && (
        <Typography variant="caption" color={colors.danger} style={styles.errorText}>
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.m,
  },
  label: {
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.m,
    paddingHorizontal: spacing.m,
    height: 52,
  },
  inputError: {
    borderColor: colors.danger,
  },
  icon: {
    marginRight: spacing.s,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    height: '100%',
  },
  errorText: {
    marginTop: spacing.xs,
  },
});

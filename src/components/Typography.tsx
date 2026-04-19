import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'button';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  weight?: 'normal' | 'bold' | '600' | '500' | '700' | '800';
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = colors.text,
  align = 'left',
  weight,
  style,
  children,
  ...props
}) => {
  return (
    <Text
      style={[
        styles[variant],
        { color, textAlign: align },
        weight ? { fontWeight: weight } : {},
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  h4: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14, color: colors.textSecondary },
  button: { fontSize: 16, fontWeight: '600' },
});

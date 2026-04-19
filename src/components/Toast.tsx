import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import { Typography } from './Typography';
import { colors, spacing, borderRadius } from '../theme/theme';

export interface ToastHandle {
  show: (message: string, duration?: number) => void;
}

export const Toast = forwardRef<ToastHandle>((_, ref) => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const opacity = useState(new Animated.Value(0))[0];

  useImperativeHandle(ref, () => ({
    show(msg: string, duration = 3000) {
      setMessage(msg);
      setVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setVisible(false));
      }, duration);
    },
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Card variant="elevated" style={styles.toastCard}>
        <Typography color={colors.surface} weight="600">{message}</Typography>
      </Card>
    </Animated.View>
  );
});

// Import Card here or define it if not accessible easily, 
// using a View for simplicity to avoid circular dep if any
const Card = ({ children, style }: any) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.m,
    right: spacing.m,
    zIndex: 1000,
    alignItems: 'center',
  },
  toastCard: {
    backgroundColor: '#334155',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
    borderRadius: borderRadius.round,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }
});

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

interface LoadingSpinnerProps {
  color?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  color = colors.accent, 
  size = 'large',
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }
  return <ActivityIndicator size={size} color={color} />;
};

const styles = StyleSheet.create({
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 250, 252, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

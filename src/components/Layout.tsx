import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { colors, spacing } from '../theme/theme';
import { Typography } from './Typography';

interface LayoutProps {
  children: React.ReactNode;
  backgroundColor?: string;
  useSafeArea?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  backgroundColor = colors.background,
  useSafeArea = false,
}) => {
  const [isOffline, setIsOffline] = useState(false);
  const Container = useSafeArea ? SafeAreaView : View;

  // Simulate offline check (or use NetInfo if available)
  useEffect(() => {
    // For demonstration, we'll just check if the window exists/dummy logic
    // In a real app, use @react-native-community/netinfo
  }, []);

  return (
    <Container style={[styles.container, { backgroundColor }]}>
      <StatusBar 
        barStyle={backgroundColor === colors.primary || backgroundColor === '#020617' ? 'light-content' : 'dark-content'} 
        backgroundColor={backgroundColor} 
      />
      
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Typography variant="caption" color={colors.surface} weight="600">
            No Internet Connection. Using Offline Data.
          </Typography>
        </View>
      )}

      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  offlineBanner: {
    backgroundColor: colors.danger,
    padding: spacing.xs,
    alignItems: 'center',
    zIndex: 1000,
  },
});

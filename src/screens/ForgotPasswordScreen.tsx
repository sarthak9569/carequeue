import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Layout } from '../components/Layout';
import { Typography } from '../components/Typography';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, spacing, borderRadius } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
type ForgotPasswordRouteProp = RouteProp<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ForgotPasswordRouteProp>();
  const { forgotPassword, isLoading } = useAuth();
  
  const [email, setEmail] = useState(route.params?.email || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setError('');
    setSuccess('');
    try {
      await forgotPassword(email);
      setSuccess('OTP sent successfully. Please check your email.');
      setTimeout(() => {
        navigation.navigate('VerifyOtp', { email });
      }, 1500);
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    }
  };

  return (
    <Layout>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} bounces={false}>
          <View style={styles.card}>
            <Typography variant="h3" style={styles.cardTitle}>Reset Identity Key</Typography>
            <Typography variant="body" color={colors.muted} style={styles.description}>
              Enter your registered email address. We will send a 6-digit One Time Password (OTP) to your inbox to verify your identity.
            </Typography>
            
            <Input
              label="Email Address"
              placeholder="name@example.com"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {error ? (
              <Typography variant="caption" color={colors.danger} style={styles.errorText}>
                {error}
              </Typography>
            ) : null}

            {success ? (
              <Typography variant="caption" color={colors.success} style={styles.successText}>
                {success}
              </Typography>
            ) : null}

            <Button
              title="Send Verification Request"
              onPress={handleSendOtp}
              loading={isLoading}
              style={styles.sendButton}
              icon="paper-plane-outline"
              iconPosition="right"
            />

            <Button
              title="Back to Login"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.backButton}
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: spacing.l,
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    padding: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    borderTopWidth: 4,
    borderTopColor: colors.accent,
  },
  cardTitle: {
    marginBottom: spacing.m,
    color: colors.primary,
  },
  description: {
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  sendButton: {
    marginTop: spacing.m,
    height: 56,
  },
  backButton: {
    marginTop: spacing.m,
  },
  errorText: {
    marginTop: -spacing.m,
    marginBottom: spacing.l,
    textAlign: 'left',
  },
  successText: {
    marginTop: -spacing.m,
    marginBottom: spacing.l,
    textAlign: 'left',
  },
});

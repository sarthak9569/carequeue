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

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'VerifyOtp'>;
type VerifyOtpRouteProp = RouteProp<AuthStackParamList, 'VerifyOtp'>;

export const VerifyOtpScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VerifyOtpRouteProp>();
  const { verifyOtpLogin, forgotPassword, isLoading } = useAuth();
  
  const email = route.params.email;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    
    setError('');
    try {
      await verifyOtpLogin(email, otp);
      // If successful, the AuthContext will update `user` state and the RootNavigator will automatically route to MainTabs
    } catch (e: any) {
      setError(e.message || 'Invalid OTP');
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    try {
      await forgotPassword(email);
      setSuccess('A new OTP has been sent to your email.');
    } catch (e: any) {
      setError(e.message || 'Failed to resend OTP');
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
            <Typography variant="h3" style={styles.cardTitle}>Verify Identity</Typography>
            <Typography variant="body" color={colors.muted} style={styles.description}>
              We have sent a 6-digit OTP to {email}. Please enter it below to continue.
            </Typography>
            
            <Input
              label="One Time Password (OTP)"
              placeholder="123456"
              icon="keypad-outline"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
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
              title="Verify and Proceed"
              onPress={handleVerifyOtp}
              loading={isLoading}
              style={styles.verifyButton}
              icon="checkmark-circle-outline"
              iconPosition="right"
            />

            <Button
              title="Resend OTP"
              onPress={handleResend}
              variant="outline"
              style={styles.resendButton}
              disabled={isLoading}
            />
            
            <Button
              title="Change Email Address"
              onPress={() => navigation.goBack()}
              variant="ghost"
              style={styles.changeEmailButton}
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
  verifyButton: {
    marginTop: spacing.m,
    height: 56,
  },
  resendButton: {
    marginTop: spacing.m,
  },
  changeEmailButton: {
    marginTop: spacing.s,
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

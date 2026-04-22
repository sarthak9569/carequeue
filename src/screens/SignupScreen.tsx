import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Layout } from '../components/Layout';
import { Typography } from '../components/Typography';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, spacing, borderRadius } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { signup, isLoading } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      await signup(name, email, password);
    } catch (e: any) {
      setError(e.message || 'Could not create account');
      console.error('Signup error details:', e);
    }
  };

  return (
    <Layout>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} bounces={false}>
          {/* Logo Area */}
          <View style={styles.header}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
          </View>

          {/* Signup Card */}
          <View style={styles.card}>
            <Typography variant="h3" style={styles.cardTitle}>Register Identity</Typography>
            
            <Input
              label="Full Name"
              placeholder="John Doe"
              icon="person-outline"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Email Address"
              placeholder="name@clinic.com"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Input
              label="Secret Key (Password)"
              placeholder="••••••••"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error ? (
              <Typography variant="caption" color={colors.danger} style={styles.errorText}>
                {error}
              </Typography>
            ) : null}

            <Button
              title="Establish Identity"
              onPress={handleSignup}
              loading={isLoading}
              style={styles.signupButton}
            />
          </View>

          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.goBack()}
          >
            <Typography variant="caption" weight="600" color={colors.muted}>
              ALREADY HAVE ACCESS? <Typography variant="caption" weight="800" color={colors.accent}>INITIALIZE PORTAL</Typography>
            </Typography>
          </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: spacing.m,
  },
  title: {
    fontSize: 32,
    color: colors.primary,
    fontWeight: '800',
  },
  subtitle: {
    letterSpacing: 2,
    marginTop: -5,
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
    marginBottom: spacing.xl,
    color: colors.primary,
  },
  signupButton: {
    marginTop: spacing.m,
    height: 56,
  },
  errorText: {
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  loginLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});

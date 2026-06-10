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
  
  const [regType, setRegType] = useState<'PATIENT' | 'HOSPITAL'>('PATIENT');
  const [name, setName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalCode, setHospitalCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password || (regType === 'HOSPITAL' && (!hospitalName || !hospitalCode))) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      // In a real app, you'd update the signup function to accept role and hospital details
      await signup(name, email, password, { 
        role: regType === 'HOSPITAL' ? 'hospital_admin' : 'patient',
        hospitalName,
        hospitalCode
      });
    } catch (e: any) {
      setError(e.message || 'Could not create account');
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
            <View style={styles.toggleRow}>
              <TouchableOpacity 
                style={[styles.toggleBtn, regType === 'PATIENT' && styles.activeToggle]} 
                onPress={() => { setRegType('PATIENT'); setError(''); }}
              >
                <Typography variant="caption" weight="700" color={regType === 'PATIENT' ? colors.surface : colors.muted}>PATIENT</Typography>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, regType === 'HOSPITAL' && styles.activeToggle]} 
                onPress={() => { setRegType('HOSPITAL'); setError(''); }}
              >
                <Typography variant="caption" weight="700" color={regType === 'HOSPITAL' ? colors.surface : colors.muted}>HOSPITAL</Typography>
              </TouchableOpacity>
            </View>

            <Typography variant="h3" style={styles.cardTitle}>
              {regType === 'PATIENT' ? 'Patient Registration' : 'Hospital Onboarding'}
            </Typography>
            
            {regType === 'HOSPITAL' && (
              <>
                <Input
                  label="Legal Hospital Name"
                  placeholder="City General Hospital"
                  icon="business-outline"
                  value={hospitalName}
                  onChangeText={setHospitalName}
                />
                <Input
                  label="Desired Hospital Code"
                  placeholder="e.g. CGH-NY"
                  icon="barcode-outline"
                  value={hospitalCode}
                  onChangeText={setHospitalCode}
                />
              </>
            )}

            <Input
              label={regType === 'PATIENT' ? "Full Name" : "Admin Name"}
              placeholder="John Doe"
              icon="person-outline"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Email Address"
              placeholder="name@example.com"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Input
              label="Password"
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
              title={regType === 'PATIENT' ? "Establish Identity" : "Onboard Facility"}
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
              ALREADY REGISTERED? <Typography variant="caption" weight="800" color={colors.accent}>SIGN IN HERE</Typography>
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
    marginBottom: spacing.l,
    color: colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: borderRadius.m,
    padding: 4,
    marginBottom: spacing.l,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.s,
  },
  activeToggle: {
    backgroundColor: colors.primary,
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

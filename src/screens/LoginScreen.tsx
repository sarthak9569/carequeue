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

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login, isLoading } = useAuth();
  
  const [isDoctor, setIsDoctor] = useState(false);
  const [email, setEmail] = useState('');
  const [docID, setDocID] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (isDoctor && !docID || !isDoctor && !email || !password) {
      setError('Please fill in all identity fields');
      return;
    }
    
    try {
      await login(isDoctor ? { docID, password } : { email, password });
    } catch (e: any) {
      setError(e.message || 'Invalid credentials');
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
              source={require('../../assets/icon.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
            <Typography variant="h2" align="center" style={styles.title}>QueueSeva</Typography>
            <Typography variant="caption" align="center" color={colors.muted} style={styles.subtitle}>
              THE CLINICAL SANCTUARY
            </Typography>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <TouchableOpacity 
                style={[styles.toggleBtn, !isDoctor && styles.activeToggle]} 
                onPress={() => { setIsDoctor(false); setError(''); }}
              >
                <Typography variant="caption" weight="700" color={!isDoctor ? colors.surface : colors.muted}>PATIENT</Typography>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, isDoctor && styles.activeToggle]} 
                onPress={() => { setIsDoctor(true); setError(''); }}
              >
                <Typography variant="caption" weight="700" color={isDoctor ? colors.surface : colors.muted}>DOCTOR</Typography>
              </TouchableOpacity>
            </View>

            <Typography variant="h3" style={styles.cardTitle}>Identity Verification</Typography>
            
            {!isDoctor ? (
              <Input
                label="Email Address"
                placeholder="name@clinic.com"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Input
                label="Doctor ID"
                placeholder="e.g. DOC-123"
                icon="id-card-outline"
                value={docID}
                onChangeText={setDocID}
                autoCapitalize="characters"
              />
            )}
            
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
              title="Initialize Portal"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
              icon="arrow-forward"
              iconPosition="right"
            />

            {isDoctor && (
              <Typography variant="caption" align="center" color={colors.accent} style={{ marginTop: spacing.m }}>
                Hint: Any DocID + Password 'doctor123'
              </Typography>
            )}

            <View style={styles.footer}>
              <View style={styles.avatars}>
                {/* Mock AVATARS like in screenshot */}
                <View style={[styles.avatar, { zIndex: 3, backgroundColor: '#ddd' }]} />
                <View style={[styles.avatar, { zIndex: 2, marginLeft: -10, backgroundColor: '#ccc' }]} />
                <View style={[styles.avatar, { zIndex: 1, marginLeft: -10, backgroundColor: '#bbb' }]} />
              </View>
              <Typography variant="caption" color={colors.muted} style={styles.footerText}>
                JOIN <Typography variant="caption" weight="700" color={colors.primary}>2,400+</Typography> PATIENTS IN THE CLINICAL SANCTUARY
              </Typography>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.signupLink}
            onPress={() => navigation.navigate('Signup')}
          >
            <Typography variant="caption" weight="600" color={colors.muted}>
              NEW TO THE SANCTUARY? <Typography variant="caption" weight="800" color={colors.accent}>REGISTER IDENTITY</Typography>
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
    width: 60,
    height: 60,
    marginBottom: spacing.s,
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
  passwordRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: -20,
    zIndex: 1,
  },
  loginButton: {
    marginTop: spacing.m,
    height: 56,
  },
  errorText: {
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  avatars: {
    flexDirection: 'row',
    marginBottom: spacing.s,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  footerText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  signupLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});

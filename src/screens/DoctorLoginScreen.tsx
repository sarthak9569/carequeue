import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';

import { Layout } from '../components/Layout';
import { Typography } from '../components/Typography';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

export const DoctorLoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { doctorLogin } = useAuth();
  const [hospitalCode, setHospitalCode] = useState('');
  const [docId, setDocId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!hospitalCode || !docId) {
      Alert.alert('Incomplete Credentials', 'Please provide both Hospital Code and Doctor ID to enter the secure queue control system.');
      return;
    }

    setLoading(true);
    try {
      await doctorLogin(hospitalCode, docId);
      // AuthContext will automatically navigate via RootNavigator's conditional rendering
    } catch (error: any) {
      Alert.alert('Unauthorized Access', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Typography variant="h2" weight="800" style={styles.title}>
              Queue Control
            </Typography>
            <Typography variant="body" color={colors.muted} style={styles.subtitle}>
              Secure Medical Professional Access
            </Typography>
          </View>

          <View style={styles.form}>
            <View style={styles.idCard}>
              <Ionicons name="medical-sharp" size={40} color={colors.primary} />
              <Typography variant="h4" weight="700" style={{ marginTop: spacing.s }}>
                Staff Authentication
              </Typography>
            </View>

            <Input 
              label="HOSPITAL CODE"
              placeholder="e.g. HOSP-VAR-01"
              value={hospitalCode}
              onChangeText={setHospitalCode}
              icon="business-outline"
              autoCapitalize="characters"
            />

            <Input 
              label="DOCTOR ID (DOCID)"
              placeholder="e.g. DOC-123"
              value={docId}
              onChangeText={setDocId}
              icon="person-outline"
              autoCapitalize="characters"
            />

            <Button 
              title="Enter Dashboard" 
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
              size="large"
            />
          </View>

          <View style={styles.footer}>
            <Typography variant="caption" color={colors.muted} align="center">
              By accessing this system, you agree to comply with HIPAA/clinical data security protocols of your facility.
            </Typography>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollContent: { 
    flexGrow: 1, 
    padding: spacing.xl,
    justifyContent: 'center'
  },
  header: {
    marginBottom: spacing.xxl,
    alignItems: 'center'
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.m
  },
  title: {
    color: colors.primary,
    textAlign: 'center'
  },
  subtitle: {
    marginTop: spacing.xs,
    textAlign: 'center'
  },
  form: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 30,
    ...shadows.soft
  },
  idCard: {
    alignItems: 'center',
    marginBottom: spacing.l
  },
  loginBtn: {
    marginTop: spacing.l
  },
  footer: {
    marginTop: spacing.xxl,
    opacity: 0.6
  }
});

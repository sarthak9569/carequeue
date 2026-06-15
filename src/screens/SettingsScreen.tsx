import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isLocationEnabled, setIsLocationEnabled] = useState(true);
  const [isHospitalOnline, setIsHospitalOnline] = useState(true);

  const isHospital = user?.role === 'hospital_admin' || user?.role === 'department_admin';

  const handleDeleteAccount = () => {
    Alert.alert(
      'Permanent Deletion',
      'Are you sure you want to delete your clinical identity? This action cannot be undone and all your history will be wiped.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Permanently', 
          style: 'destructive',
          onPress: async () => {
            // In a real app, call API to delete
            Alert.alert('Success', 'Identity wiped from Sanctuary servers. Logging out.');
            logout();
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to end your session?', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  };

  const renderSettingItem = (icon: any, title: string, subtitle?: string, onPress?: () => void, rightElement?: React.ReactNode) => (
    <TouchableOpacity style={styles.item} onPress={onPress} disabled={!onPress && !rightElement}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Typography variant="body" weight="600">{title}</Typography>
        {subtitle && <Typography variant="caption" color={colors.muted}>{subtitle}</Typography>}
      </View>
      <View style={styles.rightAction}>
        {rightElement || (onPress && <Ionicons name="chevron-forward" size={18} color={colors.muted} />)}
      </View>
    </TouchableOpacity>
  );

  return (
    <Layout>
      <Header title="Sanctuary Settings" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Account Identity */}
        <Typography variant="caption" weight="800" color={colors.primary} style={styles.sectionTitle}>ACCOUNT IDENTITY</Typography>
        <Card style={styles.sectionCard}>
          <TouchableOpacity 
            style={styles.profileSummary} 
            onPress={() => navigation.navigate(isHospital ? 'HospitalProfile' : 'Profile')}
          >
            <View style={styles.avatarLarge}>
              <Typography variant="h2" color={colors.surface}>{user?.name?.charAt(0)}</Typography>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.m }}>
              <Typography variant="h4">{user?.name}</Typography>
              <Typography variant="caption" color={colors.muted}>{user?.email || 'Registered via Phone'}</Typography>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          {renderSettingItem('shield-outline', 'Security', 'Password & 2FA', () => Alert.alert('Security', 'Security settings are managed by your organization.'))}
          {renderSettingItem('trash-outline', 'Delete Account', 'Permanently wipe clinical data', handleDeleteAccount)}
        </Card>

        {/* Hospital Configuration */}
        {isHospital && (
          <>
            <Typography variant="caption" weight="800" color={colors.primary} style={styles.sectionTitle}>HOSPITAL CONFIG</Typography>
            <Card style={styles.sectionCard}>
              {renderSettingItem('power-outline', 'Operational Status', 'Enable/Disable live discovery', undefined, 
                <Switch 
                  value={isHospitalOnline} 
                  onValueChange={setIsHospitalOnline}
                  trackColor={{ false: '#cbd5e1', true: colors.accent }}
                />
              )}
              {renderSettingItem('notifications-circle-outline', 'Booking Alerts', 'SMS notify on new tokens', () => {})}
              {renderSettingItem('stats-chart-outline', 'Public Analytics', 'Show wait times to patients', undefined, 
                <Switch 
                  value={true} 
                  trackColor={{ false: '#cbd5e1', true: colors.accent }}
                />
              )}
            </Card>
          </>
        )}

        {/* App Preferences */}
        <Typography variant="caption" weight="800" color={colors.primary} style={styles.sectionTitle}>APP PREFERENCES</Typography>
        <Card style={styles.sectionCard}>
          {renderSettingItem('notifications-outline', 'Push Notifications', 'Real-time turn alerts', undefined, 
            <Switch 
              value={isNotificationsEnabled} 
              onValueChange={setIsNotificationsEnabled}
              trackColor={{ false: '#cbd5e1', true: colors.accent }}
            />
          )}
          {renderSettingItem('location-outline', 'Location Services', 'Nearby hospital discovery', undefined, 
            <Switch 
              value={isLocationEnabled} 
              onValueChange={setIsLocationEnabled}
              trackColor={{ false: '#cbd5e1', true: colors.accent }}
            />
          )}
          {renderSettingItem('language-outline', 'App Language', 'Current: English')}
          {renderSettingItem('color-palette-outline', 'Appearance', 'Current: System Default')}
        </Card>

        {/* Support & Legal */}
        <Typography variant="caption" weight="800" color={colors.primary} style={styles.sectionTitle}>SUPPORT & LEGAL</Typography>
        <Card style={styles.sectionCard}>
          {renderSettingItem('help-circle-outline', 'Help Center', 'FAQs & Troubleshooting')}
          {renderSettingItem('document-text-outline', 'Privacy Policy')}
          {renderSettingItem('information-circle-outline', 'About Sanctuary', 'Version 2.4.0 (Stable)')}
        </Card>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={colors.danger} />
            <Typography variant="body" weight="700" color={colors.danger} style={{ marginLeft: spacing.s }}>
              Logout of Session
            </Typography>
          </TouchableOpacity>
          <Typography variant="caption" align="center" color={colors.muted} style={{ marginTop: spacing.l }}>
            Patient ID: {user?.id?.substring(0, 8).toUpperCase()} • Clinical Network
          </Typography>
        </View>

      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.m, paddingBottom: spacing.xxl },
  sectionTitle: { marginBottom: spacing.s, marginLeft: spacing.xs, letterSpacing: 1, marginTop: spacing.s },
  sectionCard: { padding: 0, marginBottom: spacing.m, overflow: 'hidden', ...shadows.soft },
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.l,
    backgroundColor: '#f8fafc',
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 39, 68, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  textContainer: { flex: 1 },
  rightAction: { marginLeft: spacing.s },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.l,
    backgroundColor: '#fff1f2',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  footer: {
    marginTop: spacing.l,
    marginBottom: spacing.xl,
  },
});

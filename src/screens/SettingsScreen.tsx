import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { colors, spacing, borderRadius } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Permanent Deletion',
      'Are you sure you want to delete your clinical identity? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Identity wiped. You are now logged out.');
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
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Typography variant="body" weight="600">{title}</Typography>
        {subtitle && <Typography variant="caption" color={colors.muted}>{subtitle}</Typography>}
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={18} color={colors.muted} />}
    </TouchableOpacity>
  );

  return (
    <Layout>
      <Header title="Clinical Settings" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Account Section */}
        <Typography variant="caption" weight="700" color={colors.muted} style={styles.sectionTitle}>ACCOUNT IDENTITY</Typography>
        <Card style={styles.sectionCard}>
          {renderSettingItem('person-outline', 'My Profile', 'Personal info & ID', () => navigation.navigate('Profile'))}
          {renderSettingItem('call-outline', 'Change Number', 'Update contact point')}
          {renderSettingItem('trash-outline', 'Delete Account', 'Permanently wipe data', handleDeleteAccount)}
        </Card>

        {/* Preferences */}
        <Typography variant="caption" weight="700" color={colors.muted} style={styles.sectionTitle}>APP PREFERENCES</Typography>
        <Card style={styles.sectionCard}>
          {renderSettingItem('language-outline', 'App Language', 'Current: English')}
          {renderSettingItem('notifications-outline', 'Push Notifications', 'Real-time alerts', undefined, 
            <Switch 
              value={isNotificationsEnabled} 
              onValueChange={setIsNotificationsEnabled}
              trackColor={{ false: '#cbd5e1', true: colors.accent }}
            />
          )}
          {renderSettingItem('shield-checkmark-outline', 'Permissions', 'Location, Camera, Storage')}
        </Card>

        {/* Support */}
        <Typography variant="caption" weight="700" color={colors.muted} style={styles.sectionTitle}>SUPPORT & HELP</Typography>
        <Card style={styles.sectionCard}>
          {renderSettingItem('help-circle-outline', 'FAQs', 'Frequently asked questions')}
          {renderSettingItem('information-circle-outline', 'About CareQueue', 'v1.2.0')}
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Typography variant="body" weight="700" color={colors.danger} style={{ marginLeft: spacing.s }}>Logout Session</Typography>
        </TouchableOpacity>

      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.m, paddingBottom: spacing.xxl },
  sectionTitle: { marginBottom: spacing.s, marginLeft: spacing.xs, letterSpacing: 1 },
  sectionCard: { padding: spacing.xs, marginBottom: spacing.l },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 39, 68, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  textContainer: { flex: 1 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.l,
    backgroundColor: '#fff1f2',
    borderRadius: borderRadius.m,
    marginTop: spacing.m,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
});

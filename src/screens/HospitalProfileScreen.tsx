import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

import { adminService } from '../services/adminService';

export const HospitalProfileScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    _id: '',
    name: '',
    code: '',
    address: '',
    contact: '',
    email: '',
    website: '',
    regNumber: '',
    type: 'Private'
  });

  const [isEditing, setIsEditing] = useState(false);

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await adminService.getMyHospital();
      if (res.data && res.data.data) {
        const d = res.data.data;
        setProfile({
          _id: d._id,
          name: d.name || '',
          code: d.code || '',
          address: d.address || '',
          contact: d.contact || '',
          email: d.email || '',
          website: d.website || '',
          regNumber: d.registrationNumber || '',
          type: d.type || 'Private'
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        ...profile,
        registrationNumber: profile.regNumber
      };
      await adminService.updateHospital(profile._id, payload);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label: string, value: string, key: string) => (
    <View style={styles.fieldContainer}>
      <Typography variant="caption" color={colors.textSecondary} style={styles.label}>{label}</Typography>
      {isEditing ? (
        <TextInput 
          style={styles.input} 
          value={value} 
          onChangeText={(text) => setProfile({...profile, [key]: text})}
        />
      ) : (
        <Typography variant="body" weight="600">{value}</Typography>
      )}
    </View>
  );

  return (
    <Layout>
      <Header title="Hospital Profile" showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.mainCard}>
          <View style={styles.headerRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="business" size={32} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.m }}>
              <Typography variant="h3">{profile.name}</Typography>
              <Typography variant="caption">{profile.code}</Typography>
            </View>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Ionicons name={isEditing ? "checkmark-circle" : "create-outline"} size={28} color={colors.accent} />
            </TouchableOpacity>
          </View>

          <View style={styles.separator} />

          {renderField('Full Name', profile.name, 'name')}
          {renderField('Hospital Code', profile.code, 'code')}
          {renderField('Address', profile.address, 'address')}
          {renderField('Contact Number', profile.contact, 'contact')}
          {renderField('Email', profile.email, 'email')}
          {renderField('Website', profile.website, 'website')}
          {renderField('Registration Number', profile.regNumber, 'regNumber')}
          {renderField('Type', profile.type, 'type')}

          {isEditing && (
            <Button 
              title="Save Changes" 
              loading={loading}
              onPress={handleSave} 
              style={{ marginTop: spacing.l }} 
            />
          )}
        </Card>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: spacing.m },
  mainCard: { padding: spacing.l, ...shadows.medium },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.l },
  iconContainer: { 
    width: 60, 
    height: 60, 
    borderRadius: borderRadius.m, 
    backgroundColor: colors.lightAccent, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  separator: { height: 1, backgroundColor: colors.border, marginBottom: spacing.l },
  fieldContainer: { marginBottom: spacing.m },
  label: { marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { 
    borderWidth: 1, 
    borderColor: colors.border, 
    borderRadius: borderRadius.s, 
    padding: spacing.s, 
    fontSize: 16, 
    color: colors.text,
    backgroundColor: colors.background
  }
});

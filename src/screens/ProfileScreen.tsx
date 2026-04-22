import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { prescriptionService, Prescription } from '../services/prescriptionService';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [birthday, setBirthday] = useState(user?.birthday || '1995-08-15');
  const [isEditing, setIsEditing] = useState(false);

  // Prescription states
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    if (!user?.id) return;
    setLoadingPrescriptions(true);
    try {
      const response = await prescriptionService.getPrescriptions(user.id);
      if (response.data.success) {
        setPrescriptions(response.data.prescriptions);
      }
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const handleUploadPrescription = () => {
    Alert.prompt(
      'Upload Prescription',
      'Enter a title for your medical document',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upload',
          onPress: async (title) => {
            if (!title) return;
            try {
              await prescriptionService.uploadPrescription({
                userId: user?.id || '',
                title,
                fileName: `${title.replace(/\s+/g, '_')}.pdf`,
                fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
              });
              Alert.alert('Success', 'Prescription uploaded successfully');
              fetchPrescriptions();
            } catch (error) {
              Alert.alert('Error', 'Failed to upload prescription');
            }
          }
        }
      ]
    );
  };

  const handleDownload = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open the document.'));
  };

  const handleDeletePrescription = (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to remove this prescription?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await prescriptionService.deletePrescription(id);
            fetchPrescriptions();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete prescription');
          }
        }
      }
    ]);
  };

  const handleSave = () => {
    updateProfile({ name, email, phone, birthday });
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  return (
    <Layout>
      <Header 
        title="My Profile" 
        showBack 
        rightElement={
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editBtn}>
            <Typography variant="body" color={colors.surface} weight="700">
              {isEditing ? 'Cancel' : 'Edit'}
            </Typography>
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, shadows.medium]}>
            <Typography variant="h1" color={colors.surface}>{name.charAt(0)}</Typography>
            <TouchableOpacity style={styles.cameraIcon}>
              <Ionicons name="camera" size={20} color={colors.surface} />
            </TouchableOpacity>
          </View>
          <Typography variant="h2" weight="800" style={styles.userName}>{name}</Typography>
          <View style={styles.roleBadge}>
            <Typography variant="caption" color={colors.accent} weight="800">{user?.role.toUpperCase()} ACCOUNT</Typography>
          </View>
        </View>

        <Typography variant="caption" weight="800" color={colors.muted} style={styles.sectionLabel}>IDENTITY DETAILS</Typography>
        <Card style={styles.formCard}>
          <Input 
            label="Full Name"
            value={name}
            onChangeText={setName}
            editable={isEditing}
            icon="person-outline"
          />
          <Input 
            label="Email Identity"
            value={email}
            onChangeText={setEmail}
            editable={isEditing}
            icon="mail-outline"
            keyboardType="email-address"
          />
          <Input 
            label="Contact Number"
            value={phone}
            onChangeText={setPhone}
            editable={isEditing}
            icon="call-outline"
            keyboardType="phone-pad"
          />
          <Input 
            label="Date of Birth"
            value={birthday}
            onChangeText={setBirthday}
            editable={isEditing}
            icon="calendar-outline"
            placeholder="YYYY-MM-DD"
          />
        </Card>

        {isEditing && (
          <Button 
            title="Save Profile Changes" 
            onPress={handleSave} 
            variant="primary" 
            style={styles.saveBtn}
            icon="checkmark-outline"
          />
        )}

        {/* Prescription Subsection */}
        <View style={styles.prescriptionHeader}>
          <Typography variant="caption" weight="800" color={colors.muted} style={styles.sectionLabel}>MY PRESCRIPTIONS</Typography>
          <TouchableOpacity onPress={handleUploadPrescription} style={styles.uploadBtn}>
            <Ionicons name="cloud-upload-outline" size={20} color={colors.accent} />
            <Typography variant="caption" weight="700" color={colors.accent} style={{ marginLeft: 4 }}>UPLOAD</Typography>
          </TouchableOpacity>
        </View>

        <Card style={styles.prescriptionCard}>
          {loadingPrescriptions ? (
            <ActivityIndicator color={colors.accent} style={{ padding: spacing.m }} />
          ) : prescriptions.length > 0 ? (
            prescriptions.map((p) => (
              <View key={p._id} style={styles.prescriptionItem}>
                <View style={styles.prescIcon}>
                  <MaterialCommunityIcons name="file-pdf-box" size={24} color={colors.danger} />
                </View>
                <View style={styles.prescDetails}>
                  <Typography variant="body" weight="600" numberOfLines={1}>{p.title}</Typography>
                  <Typography variant="caption" color={colors.muted}>
                    {new Date(p.uploadedAt).toLocaleDateString()}
                  </Typography>
                </View>
                <TouchableOpacity onPress={() => handleDownload(p.fileUrl)} style={styles.actionIcon}>
                  <Ionicons name="download-outline" size={22} color={colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePrescription(p._id)} style={styles.actionIcon}>
                  <Ionicons name="trash-outline" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={40} color={colors.border} />
              <Typography variant="caption" color={colors.muted} align="center" style={{ marginTop: spacing.s }}>
                No clinical documents uploaded yet.
              </Typography>
            </View>
          )}
        </Card>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.l, paddingBottom: spacing.xxl },
  editBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
    position: 'relative',
    borderWidth: 4,
    borderColor: colors.surface,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  userName: { marginBottom: spacing.xs, color: colors.text },
  roleBadge: {
    backgroundColor: colors.lightAccent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
  },
  sectionLabel: { 
    marginBottom: spacing.s, 
    marginLeft: spacing.xs, 
    letterSpacing: 1.5,
  },
  formCard: { 
    padding: spacing.l, 
    marginBottom: spacing.l,
    borderRadius: borderRadius.l,
  },
  saveBtn: { marginBottom: spacing.xl, height: 56 },
  
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightAccent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.s,
  },
  prescriptionCard: {
    padding: spacing.m,
    borderRadius: borderRadius.l,
  },
  prescriptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  prescIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#fff1f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  prescDetails: {
    flex: 1,
  },
  actionIcon: {
    padding: spacing.s,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

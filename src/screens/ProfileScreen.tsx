import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, spacing, borderRadius } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [birthday, setBirthday] = useState(user?.birthday || '1995-08-15');
  const [isEditing, setIsEditing] = useState(false);

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
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Typography variant="body" color={colors.surface}>{isEditing ? 'Cancel' : 'Edit'}</Typography>
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Typography variant="h1" color={colors.surface}>{name.charAt(0)}</Typography>
          </View>
          <Typography variant="h3" style={styles.userName}>{name}</Typography>
          <Typography variant="caption" color={colors.muted}>{user?.role.toUpperCase()} ACCOUNT</Typography>
        </View>

        <Card style={styles.formCard}>
          <Input 
            label="Username"
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
            title="Update Identity" 
            onPress={handleSave} 
            variant="primary" 
            style={styles.saveBtn}
          />
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.l },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  userName: { marginBottom: spacing.xs },
  formCard: { padding: spacing.l },
  saveBtn: { marginTop: spacing.l },
});

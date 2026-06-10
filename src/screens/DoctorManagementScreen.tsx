import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Modal,
  Alert
} from 'react-native';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/StatusUI';
import { Input } from '../components/Input';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

import { adminService } from '../services/adminService';
import { apiService } from '../services/apiService';

export const DoctorManagementScreen: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [newDoctor, setNewDoctor] = useState({ 
    name: '', 
    email: '', 
    medicalRegistrationNumber: '',
    password: 'Password123',
    department: '',
    hospital: ''
  });

  React.useEffect(() => {
    fetchDoctors();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await apiService.getDepartments();
      if (res.data && res.data.data) {
        setDepartments(res.data.data);
        if (res.data.data.length > 0) {
          setNewDoctor(prev => ({ ...prev, department: res.data.data[0]._id }));
        }
      }
      
      const hospRes = await adminService.getMyHospital();
      if (hospRes.data && hospRes.data.data) {
        setNewDoctor(prev => ({ ...prev, hospital: hospRes.data.data._id }));
      }
    } catch (e) {}
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDoctors();
      if (res.data && res.data.data) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async () => {
    try {
      if (!newDoctor.name || !newDoctor.email || !newDoctor.department) {
        return Alert.alert('Error', 'Please fill all fields including department');
      }
      setLoading(true);
      await adminService.onboardDoctor(newDoctor);
      setShowModal(false);
      setNewDoctor(prev => ({ 
        ...prev, 
        name: '', 
        email: '', 
        medicalRegistrationNumber: '', 
        password: 'Password123' 
      }));
      fetchDoctors();
      Alert.alert('Success', 'Doctor onboarded');
    } catch (error) {
      Alert.alert('Error', 'Failed to onboard doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Header title="Doctors" showBack />
      <View style={styles.container}>
        <View style={styles.actionHeader}>
          <Typography variant="h3">Medical Staff</Typography>
          <Button 
            title="Onboard Doctor" 
            size="small" 
            onPress={() => setShowModal(true)}
            icon={<Ionicons name="person-add" size={18} color={colors.surface} />} 
          />
        </View>

        <FlatList
          data={doctors}
          keyExtractor={item => item._id || item.id}
          refreshing={loading}
          onRefresh={fetchDoctors}
          renderItem={({ item }) => (
            <Card style={styles.doctorCard}>
              <View style={styles.doctorInfo}>
                <View style={styles.avatar}>
                  <Typography weight="700" color={colors.accent}>{(item.name || 'D')[0]}</Typography>
                </View>
                <View style={{ marginLeft: spacing.m, flex: 1 }}>
                  <Typography weight="600">{item.name}</Typography>
                  <Typography variant="caption" color={colors.textSecondary}>
                    {item.department?.name || 'General'} • {item.medicalRegistrationNumber || 'REG-NA'}
                  </Typography>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Badge 
                  label={item.status || 'Offline'} 
                  variant={item.status === 'Online' ? 'success' : (item.status === 'Busy' ? 'warning' : 'info')} 
                />
              </View>
            </Card>
          )}
        />

        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalContent}>
              <Typography variant="h3" style={{ marginBottom: spacing.l }}>Onboard Doctor</Typography>
              <Input 
                label="Full Name" 
                placeholder="Dr. John Smith" 
                value={newDoctor.name}
                onChangeText={(t) => setNewDoctor({...newDoctor, name: t})}
              />
              <Input 
                label="Email" 
                placeholder="doctor@hospital.com" 
                value={newDoctor.email}
                onChangeText={(t) => setNewDoctor({...newDoctor, email: t})}
              />
              <Input 
                label="Registration No" 
                placeholder="MR-12345" 
                value={newDoctor.medicalRegistrationNumber}
                onChangeText={(t) => setNewDoctor({...newDoctor, medicalRegistrationNumber: t})}
              />
              <View style={styles.modalButtons}>
                <Button title="Cancel" variant="outline" style={{ flex: 1, marginRight: spacing.s }} onPress={() => setShowModal(false)} />
                <Button title="Onboard" style={{ flex: 1 }} onPress={handleOnboard} loading={loading} />
              </View>
            </Card>
          </View>
        </Modal>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.m },
  actionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.l },
  doctorCard: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.m, marginBottom: spacing.m, ...shadows.soft },
  doctorInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 45, height: 45, borderRadius: 22, backgroundColor: colors.lightAccent, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.m },
  modalContent: { padding: spacing.xl, borderRadius: 24 },
  modalButtons: { flexDirection: 'row', marginTop: spacing.l }
});

import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList,
  Modal,
  Alert,
  TouchableOpacity
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

const ROLES = ['Receptionist', 'Nurse', 'Lab Technician', 'Pharmacist', 'Administrator'];

export const StaffManagementScreen: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    staffId: '', 
    role: 'Nurse', 
    contactDetails: '',
    department: '' 
  });

  React.useEffect(() => {
    initScreen();
  }, []);

  const initScreen = async () => {
    try {
      setLoading(true);
      const hostRes = await apiService.getMyHospital();
      if (hostRes.data && hostRes.data.data) {
        const id = hostRes.data.data._id;
        setHospitalId(id);
        fetchStaff(id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStaff = async (hId: string) => {
    try {
      const res = await adminService.getStaff(hId);
      if (res.data && res.data.data) setStaff(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!hospitalId) {
      return Alert.alert('Identity Synchronization Error', 'Your hospital session is not fully synchronized from the clinical registry. Please log out and log back in.');
    }
    if (!form.name || !form.staffId) return Alert.alert('Validation Error', 'Legal Name and Clinical Staff ID are required');
    try {
      setLoading(true);
      const payload = { 
        ...form, 
        hospital: hospitalId,
        action: 'create' 
      };
      
      // Clinical validation: Ensure empty department IDs are not sent
      if (!payload.department) delete (payload as any).department;

      await adminService.addStaff(payload);
      setShowModal(false);
      setForm({ name: '', staffId: '', role: 'Nurse', contactDetails: '', department: '' });
      fetchStaff(hospitalId);
      Alert.alert('Success', 'Personnel record established');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to add personnel to clinical record';
      Alert.alert('Clinical Registry Error', msg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Layout>
      <Header title="Staff Management" showBack />
      <View style={styles.container}>
        <View style={styles.actionHeader}>
          <Typography variant="h3">Hospital Personnel</Typography>
          <Button title="Add Staff" size="small" onPress={() => setShowModal(true)} />
        </View>

        <FlatList
          data={staff}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <Card style={styles.staffCard}>
              <View style={styles.staffMain}>
                <Typography weight="700">{item.name}</Typography>
                <Typography variant="caption" color={colors.textSecondary}>{item.role} • ID: {item.staffId}</Typography>
              </View>
              <Badge label={item.status} variant={item.status === 'Active' ? 'success' : 'warning'} />
            </Card>
          )}
        />

        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalContent}>
              <Typography variant="h3" style={{ marginBottom: spacing.l }}>New Staff Member</Typography>
              <Input label="Name" value={form.name} onChangeText={t => setForm({...form, name: t})} />
              <Input label="Staff ID" value={form.staffId} onChangeText={t => setForm({...form, staffId: t})} />
              <Typography variant="caption" weight="600" style={{ marginBottom: 8 }}>ROLE</Typography>
              <View style={styles.rolePicker}>
                {ROLES.map(role => (
                  <TouchableOpacity 
                    key={role} 
                    style={[styles.roleItem, form.role === role && styles.roleActive]} 
                    onPress={() => setForm({...form, role})}
                  >
                    <Typography variant="caption" color={form.role === role ? colors.surface : colors.text}>{role}</Typography>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalButtons}>
                <Button title="Cancel" variant="outline" style={{ flex: 1, marginRight: spacing.s }} onPress={() => setShowModal(false)} />
                <Button title="Save" style={{ flex: 1 }} onPress={handleCreate} />
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
  actionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.l },
  staffCard: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.m, marginBottom: spacing.s, ...shadows.soft },
  staffMain: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.m },
  modalContent: { padding: spacing.xl, borderRadius: 24 },
  modalButtons: { flexDirection: 'row', marginTop: spacing.l },
  rolePicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.m },
  roleItem: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  roleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
});

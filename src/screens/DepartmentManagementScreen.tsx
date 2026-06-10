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

export const DepartmentManagementScreen: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '', hospital: '' });

  React.useEffect(() => {
    fetchDepartments();
    fetchHospital();
  }, []);

  const fetchHospital = async () => {
    try {
      const res = await adminService.getMyHospital();
      if (res.data && res.data.data) {
        setNewDept(prev => ({ ...prev, hospital: res.data.data._id }));
      }
    } catch (e) {}
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await apiService.getDepartments();
      if (res.data && res.data.data) {
        setDepartments(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!newDept.name || !newDept.code) return Alert.alert('Error', 'Please fill all fields');
      setLoading(true);
      await adminService.createDepartment(newDept);
      setShowModal(false);
      setNewDept(prev => ({ ...prev, name: '', code: '', description: '' }));
      fetchDepartments();
      Alert.alert('Success', 'Department created');
    } catch (error) {
      Alert.alert('Error', 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Header title="Departments" showBack />
      <View style={styles.container}>
        <View style={styles.actionHeader}>
          <Typography variant="h3">Department List</Typography>
          <Button 
            title="Create New" 
            variant="outline" 
            size="small" 
            onPress={() => setShowModal(true)}
            icon={<Ionicons name="add" size={18} color={colors.accent} />} 
          />
        </View>

        <FlatList
          data={departments}
          keyExtractor={item => item._id || item.id}
          refreshing={loading}
          onRefresh={fetchDepartments}
          renderItem={({ item }) => (
            <Card style={styles.deptCard}>
              <View style={styles.deptMain}>
                <Typography weight="600" variant="body">{item.name}</Typography>
                <Typography variant="caption" color={colors.textSecondary}>Code: {item.code}</Typography>
              </View>
              <View style={styles.deptActions}>
                <Badge 
                  label={item.status} 
                  variant={item.status === 'Active' || item.status === 'active' ? 'success' : 'warning'} 
                />
                <TouchableOpacity style={styles.editBtn}>
                  <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </Card>
          )}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        />

        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalContent}>
              <Typography variant="h3" style={{ marginBottom: spacing.l }}>New Department</Typography>
              <Input 
                label="Department Name" 
                placeholder="e.g. Cardiology" 
                value={newDept.name}
                onChangeText={(t) => setNewDept({...newDept, name: t})}
              />
              <Input 
                label="Dept Code" 
                placeholder="e.g. CARD-01" 
                value={newDept.code}
                onChangeText={(t) => setNewDept({...newDept, code: t})}
              />
              <View style={styles.modalButtons}>
                <Button title="Cancel" variant="outline" style={{ flex: 1, marginRight: spacing.s }} onPress={() => setShowModal(false)} />
                <Button title="Create" style={{ flex: 1 }} onPress={handleCreate} loading={loading} />
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
  actionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: spacing.l 
  },
  deptCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: spacing.m, 
    marginBottom: spacing.m,
    ...shadows.soft
  },
  deptMain: { flex: 1 },
  deptActions: { flexDirection: 'row', alignItems: 'center' },
  editBtn: { marginLeft: spacing.m },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.m },
  modalContent: { padding: spacing.xl, borderRadius: 24 },
  modalButtons: { flexDirection: 'row', marginTop: spacing.l }
});

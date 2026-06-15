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
  const [editingId, setEditingId] = useState<string | null>(null);

  React.useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const hostRes = await apiService.getMyHospital();
      if (hostRes.data && hostRes.data.data) {
        const hId = hostRes.data.data._id;
        setNewDept(prev => ({ ...prev, hospital: hId }));
        const deptRes = await apiService.getDepartments(hId);
        if (deptRes.data && deptRes.data.data) {
          setDepartments(deptRes.data.data);
        }
      } else {
        Alert.alert('Registry Error', 'Your hospital identity record was not found in the sanctuary registry.');
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Network Error', 'Failed to synchronize with clinical registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!newDept.name || !newDept.code) return Alert.alert('Error', 'Clinical name and code are required');
      if (!newDept.hospital) {
        return Alert.alert('Identity Error', 'Could not verify your hospital record. Please refresh or relog.');
      }
      
      setLoading(true);
      if (editingId) {
        await apiService.updateDepartment(editingId, newDept);
        Alert.alert('Success', 'Specialty record updated');
      } else {
        const res = await apiService.addDepartment(newDept);
        if (res.data && res.data.success) {
          Alert.alert('Success', 'New clinical specialty created');
        }
      }
      setShowModal(false);
      setEditingId(null);
      setNewDept(prev => ({ ...prev, name: '', code: '', description: '' }));
      fetchInitialData();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to save specialty core';
      Alert.alert('Clinical Registry Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Remove Department',
      'Are you sure you want to disable this department? It will no longer be visible to patients.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disable', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteDepartment(id);
              fetchInitialData();
            } catch (e) { Alert.alert('Error', 'Failed to disable'); }
          }
        }
      ]
    );
  };

  const openEdit = (dept: any) => {
    setEditingId(dept._id);
    setNewDept({ 
      name: dept.name, 
      code: dept.code, 
      description: dept.description || '', 
      hospital: dept.hospital 
    });
    setShowModal(true);
  };

  return (
    <Layout>
      <Header title="Manage Specialties" showBack />
      <View style={styles.container}>
        <View style={styles.actionHeader}>
          <Typography variant="h3">Department List</Typography>
          <Button 
            title="Add Specialty" 
            variant="outline" 
            size="small" 
            onPress={() => {
              setEditingId(null);
              setNewDept(prev => ({ ...prev, name: '', code: '', description: '' }));
              setShowModal(true);
            }}
            icon={<Ionicons name="add" size={18} color={colors.accent} />} 
          />
        </View>

        <FlatList
          data={departments}
          keyExtractor={item => item._id || item.id}
          refreshing={loading}
          onRefresh={fetchInitialData}
          renderItem={({ item }) => (
            <Card style={styles.deptCard}>
              <View style={styles.deptMain}>
                <Typography weight="700" variant="body">{item.name}</Typography>
                <Typography variant="caption" color={colors.muted}>CODE: {item.code}</Typography>
              </View>
              <View style={styles.deptActions}>
                <Badge 
                  label={item.status.toUpperCase()} 
                  variant={item.status.toLowerCase() === 'active' ? 'success' : 'warning'} 
                />
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                  <Ionicons name="pencil" size={18} color={colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.editBtn} onPress={() => handleDelete(item._id)}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </Card>
          )}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          ListEmptyComponent={
            <Typography variant="caption" align="center" style={{ marginTop: spacing.xl }}>
              No departments added yet. Use the "Add Specialty" button.
            </Typography>
          }
        />

        <Modal visible={showModal} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalContent}>
              <Typography variant="h3" style={{ marginBottom: spacing.l }}>
                {editingId ? 'Edit Department' : 'New Department'}
              </Typography>
              <Input 
                label="Department Name" 
                placeholder="e.g. Dentistry" 
                value={newDept.name}
                onChangeText={(t) => setNewDept({...newDept, name: t})}
              />
              <Input 
                label="Dept Code" 
                placeholder="e.g. DENT-01" 
                value={newDept.code}
                onChangeText={(t) => setNewDept({...newDept, code: t})}
              />
              <View style={styles.modalButtons}>
                <Button 
                  title="Cancel" 
                  variant="outline" 
                  style={{ flex: 1, marginRight: spacing.s }} 
                  onPress={() => setShowModal(false)} 
                />
                <Button 
                  title={editingId ? "Update" : "Create"} 
                  style={{ flex: 1 }} 
                  onPress={handleSave} 
                  loading={loading} 
                />
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
